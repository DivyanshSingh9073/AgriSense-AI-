import asyncio

import httpx

from app.api.routes import health as health_routes
from app.main import app


def request(method: str, path: str, *, origin: str | None = None) -> httpx.Response:
    async def request_health() -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"Origin": origin} if origin else None
            return await client.request(method, path, headers=headers)

    return asyncio.run(request_health())


def test_health_reports_api_process_status() -> None:
    response = request("GET", "/api/v1/health", origin="http://localhost:5173")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_readiness_returns_503_when_database_is_unavailable(monkeypatch) -> None:
    monkeypatch.setattr(health_routes, "check_database_connection", lambda: False)

    response = request("GET", "/api/v1/health/ready")

    assert response.status_code == 503
    assert response.json() == {
        "detail": {"status": "not_ready", "database": "unavailable"}
    }


def test_readiness_returns_ready_when_database_is_available(monkeypatch) -> None:
    monkeypatch.setattr(health_routes, "check_database_connection", lambda: True)

    response = request("GET", "/api/v1/health/ready")

    assert response.status_code == 200
    assert response.json() == {"status": "ready", "database": "ok"}