from unittest.mock import MagicMock

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db import database
from app.db.base import Base
from app.db.models import Farm, User


@pytest.fixture(autouse=True)
def clear_engine_cache():
    database.get_engine.cache_clear()
    yield
    database.get_engine.cache_clear()


def test_engine_is_reused_and_connection_probe_runs_select_one(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "sqlite+pysqlite:///:memory:")

    engine = database.get_engine()

    assert engine is database.get_engine()
    assert database.check_database_connection() is True
    engine.dispose()


def test_database_session_dependency_closes_session(monkeypatch: pytest.MonkeyPatch) -> None:
    session = MagicMock()
    session_factory = MagicMock(return_value=session)
    monkeypatch.setattr(database, "SessionLocal", session_factory)
    monkeypatch.setattr(database, "get_engine", lambda: MagicMock())

    dependency = database.get_db_session()
    assert next(dependency) is session
    dependency.close()

    session.close.assert_called_once_with()


def test_missing_database_url_does_not_create_an_engine(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)

    assert database.check_database_connection() is False


def test_user_and_farm_relationship_persists_on_sqlite() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        user = User(name="Test Farmer", email="farmer@example.test", password_hash="test-hash")
        user.farms.append(Farm(farm_name="North Field", location="Test Region"))
        session.add(user)
        session.commit()

        farm = session.scalar(select(Farm))
        assert farm is not None
        assert farm.owner.email == "farmer@example.test"

    engine.dispose()