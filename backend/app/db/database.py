from functools import lru_cache
from typing import Generator

from fastapi import HTTPException
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


class DatabaseNotConfiguredError(RuntimeError):
    """Raised when a database operation is requested without DATABASE_URL."""


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    database_url = get_settings().database_url
    if not database_url:
        raise DatabaseNotConfiguredError("DATABASE_URL is not configured.")
    return create_engine(database_url, pool_pre_ping=True)


SessionLocal = sessionmaker(autoflush=False, expire_on_commit=False)


def get_db_session() -> Generator[Session, None, None]:
    try:
        session = SessionLocal(bind=get_engine())
    except DatabaseNotConfiguredError:
        raise HTTPException(status_code=503, detail="Database is not configured.") from None

    try:
        yield session
    finally:
        session.close()


def check_database_connection() -> bool:
    try:
        with get_engine().connect() as connection:
            return connection.scalar(text("SELECT 1")) == 1
    except (DatabaseNotConfiguredError, SQLAlchemyError):
        return False