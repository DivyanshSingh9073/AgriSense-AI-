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
from app.db.models import Farm, Report, User
from app.main import app


@pytest.fixture
def reports_client(monkeypatch: pytest.MonkeyPatch):
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
                    is_email_verified=True,
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


def api_request(reports_client, method: str, path: str, **kwargs) -> httpx.Response:
    request, _, _ = reports_client
    return asyncio.run(request(method, path, **kwargs))


def test_generate_report_uses_actual_farm_profile_data(reports_client) -> None:
    _, engine, user_ids = reports_client
    with Session(engine) as session:
        farm = Farm(
            user_id=user_ids[0],
            farm_name="North Field",
            location="Meerut",
            soil_type="Loamy",
            farm_size=4.25,
            water_source="Canal",
        )
        session.add(farm)
        session.commit()
        farm_id = farm.id

    response = api_request(
        reports_client,
        "POST",
        "/api/v1/reports/generate",
        json={"farm_id": farm_id, "report_type": "crop_health"},
    )

    assert response.status_code == 201
    report = response.json()["report"]
    assert report["user_id"] == str(user_ids[0])
    assert report["farm_id"] == farm_id
    assert report["farm_name"] == "North Field"
    assert report["title"] == "Crop Health Report — North Field"
    assert "North Field" in report["summary"]
    assert "4.25 acres" in report["summary"]
    assert "Loamy" in report["summary"]
    assert "No assessment is made" in report["summary"]
    assert report["content"]["farm_profiles"] == [
        {
            "id": farm_id,
            "name": "North Field",
            "location": "Meerut",
            "farm_size": 4.25,
            "soil_type": "Loamy",
            "water_source": "Canal",
        }
    ]
    assert "Crop-health observations, disease scans, and crop measurements" in report["content"]["unavailable_data"]
    with Session(engine) as session:
        saved = session.scalar(select(Report))
        assert saved is not None
        assert saved.user_id == user_ids[0]
        assert saved.content["farm_profiles"][0]["location"] == "Meerut"


def test_generate_all_farms_and_empty_farm_data_is_honest(reports_client) -> None:
    response = api_request(
        reports_client,
        "POST",
        "/api/v1/reports/generate",
        json={"farm_id": None, "report_type": "yield_forecast"},
    )

    report = response.json()["report"]
    assert response.status_code == 201
    assert report["farm_id"] is None
    assert report["content"]["farm_profiles"] == []
    assert "No farm records" in report["summary"]
    assert "No assessment is made" in report["summary"]
    assert "historical yield measurements" in report["summary"]


def test_report_with_partial_farm_profile_only_includes_recorded_fields(reports_client) -> None:
    _, engine, user_ids = reports_client
    with Session(engine) as session:
        farm = Farm(user_id=user_ids[0], farm_name="East Field", location="Agra")
        session.add(farm)
        session.commit()
        farm_id = farm.id

    response = api_request(
        reports_client,
        "POST",
        "/api/v1/reports/generate",
        json={"farm_id": farm_id, "report_type": "soil_analysis"},
    )

    report = response.json()["report"]
    profile = report["content"]["farm_profiles"][0]
    assert response.status_code == 201
    assert profile == {
        "id": farm_id,
        "name": "East Field",
        "location": "Agra",
        "farm_size": None,
        "soil_type": None,
        "water_source": None,
    }
    assert "size:" not in report["summary"]
    assert "soil type:" not in report["summary"]
    assert "water source:" not in report["summary"]


@pytest.mark.parametrize(
    "report_type,expected_unavailable",
    [
        ("crop_health", "Crop-health observations"),
        ("weather_summary", "Weather observations"),
        ("soil_analysis", "Soil test results"),
        ("yield_forecast", "Crop details"),
    ],
)
def test_each_report_type_discloses_missing_measurements(
    reports_client,
    report_type: str,
    expected_unavailable: str,
) -> None:
    response = api_request(
        reports_client,
        "POST",
        "/api/v1/reports/generate",
        json={"farm_id": None, "report_type": report_type},
    )

    assert response.status_code == 201
    assert response.json()["report"]["content"]["unavailable_data"][0].startswith(expected_unavailable)


def test_list_reports_returns_only_authenticated_users_history(reports_client) -> None:
    first_report = api_request(
        reports_client,
        "POST",
        "/api/v1/reports/generate",
        json={"farm_id": None, "report_type": "soil_analysis"},
    )
    second_report = api_request(
        reports_client,
        "POST",
        "/api/v1/reports/generate",
        user_index=1,
        json={"farm_id": None, "report_type": "weather_summary"},
    )

    listed = api_request(reports_client, "GET", "/api/v1/reports")
    other_user_listed = api_request(reports_client, "GET", "/api/v1/reports", user_index=1)

    assert first_report.status_code == second_report.status_code == 201
    assert [item["id"] for item in listed.json()["reports"]] == [first_report.json()["report"]["id"]]
    assert [item["id"] for item in other_user_listed.json()["reports"]] == [second_report.json()["report"]["id"]]


@pytest.mark.parametrize("method,path,body", [
    ("GET", "/api/v1/reports", None),
    ("POST", "/api/v1/reports/generate", {"farm_id": None, "report_type": "crop_health"}),
])
def test_reports_endpoints_require_authentication(reports_client, method, path, body) -> None:
    kwargs = {"json": body} if body is not None else {}
    response = api_request(reports_client, method, path, user_index=None, **kwargs)
    assert response.status_code == 401


def test_cannot_generate_report_for_another_users_farm(reports_client) -> None:
    _, engine, user_ids = reports_client
    with Session(engine) as session:
        other_farm = Farm(user_id=user_ids[1], farm_name="Private Field", location="Other Region")
        session.add(other_farm)
        session.commit()
        farm_id = other_farm.id

    response = api_request(
        reports_client,
        "POST",
        "/api/v1/reports/generate",
        json={"farm_id": farm_id, "report_type": "crop_health"},
    )

    assert response.status_code == 404
    with Session(engine) as session:
        assert session.scalar(select(Report)) is None


@pytest.mark.parametrize(
    "body",
    [
        {"farm_id": 999, "report_type": "crop_health"},
        {"farm_id": 0, "report_type": "crop_health"},
        {"farm_id": -1, "report_type": "crop_health"},
        {"farm_id": None, "report_type": "unknown"},
        {"farm_id": None, "report_type": "crop_health", "user_id": "attacker"},
    ],
)
def test_generate_rejects_missing_or_invalid_farm_and_report_values(reports_client, body) -> None:
    response = api_request(reports_client, "POST", "/api/v1/reports/generate", json=body)
    assert response.status_code in {404, 422}
    with Session(reports_client[1]) as session:
        assert session.scalar(select(Report)) is None
