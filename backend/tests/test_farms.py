import asyncio
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.auth.security import create_token_pair, hash_password
from app.db.base import Base
from app.db.database import get_db_session
from app.db.models import Farm, User
from app.main import app


@pytest.fixture
def farm_client(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("JWT_SECRET_KEY", "test-only-jwt-secret-that-is-at-least-32-bytes-long")

    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)

    def override_db_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db_session] = override_db_session

    user_ids = [uuid4(), uuid4()]
    with Session(engine) as session:
        session.add_all(
            [
                User(
                    id=user_id,
                    name=f"Farmer {index}",
                    email=f"farmer{index}@example.test",
                    password_hash=hash_password("StrongPass1"),
                )
                for index, user_id in enumerate(user_ids, start=1)
            ]
        )
        session.commit()

    tokens = [create_token_pair(str(user_id)).access_token for user_id in user_ids]

    async def request(method: str, path: str, *, user_index: int | None = 0, **kwargs) -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            headers = dict(kwargs.pop("headers", {}))
            if user_index is not None:
                headers["Authorization"] = f"Bearer {tokens[user_index]}"
            return await client.request(method, path, headers=headers, **kwargs)

    yield request, engine, user_ids

    app.dependency_overrides.pop(get_db_session, None)
    engine.dispose()


def api_request(farm_client, method: str, path: str, **kwargs) -> httpx.Response:
    request, _, _ = farm_client
    return asyncio.run(request(method, path, **kwargs))


def test_create_list_get_patch_put_and_delete_farms(farm_client) -> None:
    created = api_request(
        farm_client,
        "POST",
        "/api/v1/farms",
        json={
            "farm_name": "North Field",
            "location": "Meerut, Uttar Pradesh",
            "soil_type": "Loamy",
            "farm_size": 4.25,
            "water_source": "Canal irrigation",
        },
    )

    assert created.status_code == 201
    farm = created.json()
    assert farm["farm_name"] == "North Field"
    assert farm["user_id"] == str(farm_client[2][0])
    assert isinstance(farm["id"], int)
    assert farm["farm_size"] == 4.25
    assert farm["created_at"]

    listed = api_request(farm_client, "GET", "/api/v1/farms")
    retrieved = api_request(farm_client, "GET", f"/api/v1/farms/{farm['id']}")
    assert listed.status_code == 200
    assert listed.json() == [farm]
    assert retrieved.json() == farm

    patched = api_request(
        farm_client,
        "PATCH",
        f"/api/v1/farms/{farm['id']}",
        json={"farm_name": "North Field East", "soil_type": None},
    )
    assert patched.status_code == 200
    assert patched.json()["farm_name"] == "North Field East"
    assert patched.json()["soil_type"] is None

    put_updated = api_request(
        farm_client,
        "PUT",
        f"/api/v1/farms/{farm['id']}",
        json={"farm_name": "North Field", "location": "Meerut", "farm_size": 5},
    )
    assert put_updated.status_code == 200
    assert put_updated.json()["farm_size"] == 5

    deleted = api_request(farm_client, "DELETE", f"/api/v1/farms/{farm['id']}")
    assert deleted.status_code == 204
    assert api_request(farm_client, "GET", f"/api/v1/farms/{farm['id']}").status_code == 404


def test_list_and_crud_are_scoped_to_authenticated_user(farm_client) -> None:
    first_user_id, second_user_id = farm_client[2]
    with Session(farm_client[1]) as session:
        owned_farm = Farm(user_id=first_user_id, farm_name="Private Field", location="Region One")
        other_farm = Farm(user_id=second_user_id, farm_name="Other Field", location="Region Two")
        session.add_all([owned_farm, other_farm])
        session.commit()
        owned_id = owned_farm.id
        other_id = other_farm.id

    assert [farm["farm_name"] for farm in api_request(farm_client, "GET", "/api/v1/farms").json()] == [
        "Private Field"
    ]
    for method, body in (
        ("GET", None),
        ("PATCH", {"farm_name": "Hijacked Field"}),
        ("DELETE", None),
    ):
        kwargs = {"json": body} if body is not None else {}
        response = api_request(
            farm_client,
            method,
            f"/api/v1/farms/{other_id}",
            user_index=0,
            **kwargs,
        )
        assert response.status_code == 404

    with Session(farm_client[1]) as session:
        assert session.get(Farm, other_id).farm_name == "Other Field"

    assert api_request(farm_client, "GET", f"/api/v1/farms/{owned_id}").status_code == 200


@pytest.mark.parametrize(
    "method,path,body",
    [
        ("GET", "/api/v1/farms", None),
        ("POST", "/api/v1/farms", {"farm_name": "Farm", "location": "Somewhere"}),
        ("GET", "/api/v1/farms/1", None),
        ("PATCH", "/api/v1/farms/1", {"farm_name": "Changed"}),
        ("DELETE", "/api/v1/farms/1", None),
    ],
)
def test_farm_endpoints_require_authentication(farm_client, method, path, body) -> None:
    kwargs = {"json": body} if body is not None else {}
    response = api_request(farm_client, method, path, user_index=None, **kwargs)
    assert response.status_code == 401


@pytest.mark.parametrize(
    "body",
    [
        {"location": "Somewhere"},
        {"farm_name": "A", "location": "Somewhere"},
        {"farm_name": "Farm", "location": " "},
        {"farm_name": "Farm", "location": "Somewhere", "farm_size": 0},
        {"farm_name": "Farm", "location": "Somewhere", "farm_size": -0.25},
        {"farm_name": "Farm", "location": "Somewhere", "farm_size": 1.234},
        {"farm_name": "Farm", "location": "Somewhere", "user_id": "attacker-id"},
    ],
)
def test_create_validates_fields_and_rejects_client_ownership(farm_client, body) -> None:
    response = api_request(farm_client, "POST", "/api/v1/farms", json=body)
    assert response.status_code == 422

    with Session(farm_client[1]) as session:
        assert session.scalar(select(Farm)) is None


@pytest.mark.parametrize(
    "body",
    [
        {},
        {"farm_name": None},
        {"location": None},
        {"farm_size": 0},
        {"user_id": "attacker-id"},
    ],
)
def test_patch_rejects_empty_invalid_or_untrusted_fields(farm_client, body) -> None:
    with Session(farm_client[1]) as session:
        farm = Farm(user_id=farm_client[2][0], farm_name="Original Farm", location="Original Place")
        session.add(farm)
        session.commit()
        farm_id = farm.id

    response = api_request(farm_client, "PATCH", f"/api/v1/farms/{farm_id}", json=body)

    assert response.status_code == 422
    with Session(farm_client[1]) as session:
        assert session.get(Farm, farm_id).farm_name == "Original Farm"


def test_cross_user_create_cannot_assign_another_owner(farm_client) -> None:
    body = {
        "farm_name": "My Field",
        "location": "My Region",
        "user_id": str(farm_client[2][1]),
    }
    response = api_request(farm_client, "POST", "/api/v1/farms", json=body)

    assert response.status_code == 422
    with Session(farm_client[1]) as session:
        assert session.scalar(select(Farm)) is None