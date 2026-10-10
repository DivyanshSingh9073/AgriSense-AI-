# AgriSense AI

AgriSense AI is a React 19, TypeScript, and Vite precision-agriculture frontend. It uses React Router for public, authentication, and protected dashboard routes; shared layouts and UI components; Axios feature services; and React Hook Form/Zod for validated forms.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` to the backend API root. The example value is `http://localhost:5000/api/v1`. `VITE_APP_ENV` accepts `development`, `staging`, or `production`.

The repository includes a FastAPI backend with health checks, SQLAlchemy models, Alembic migrations, authentication, and owner-scoped Farm CRUD. Its local API base URL is `http://localhost:5000/api/v1`, matching the frontend example. Password reset/email delivery and AI feature APIs are not implemented yet.

## Run the backend

From the repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --host 127.0.0.1 --port 5000
```

The health endpoint is `http://localhost:5000/api/v1/health`. Keep the frontend's `VITE_API_BASE_URL` set to `http://localhost:5000/api/v1`. Set `CORS_ORIGINS` to a comma-separated list of specific trusted origins; the development default is `http://localhost:5173`, and wildcard origins are rejected. In production, explicitly configure the frontend's deployed origin.

### Configure authentication

Set `JWT_SECRET_KEY` in `backend/.env` to a unique, randomly generated secret. For example, generate one locally with `python -c "import secrets; print(secrets.token_urlsafe(48))"`; do not commit the generated value. Production startup rejects missing, placeholder, short, or low-diversity keys; use a random key of at least 32 bytes. Access tokens expire after 15 minutes and refresh tokens after 7 days by default; configure `ACCESS_TOKEN_EXPIRE_MINUTES` and `REFRESH_TOKEN_EXPIRE_DAYS` as needed.

Authentication endpoints match the frontend's current contract:

- `POST /api/v1/auth/register` accepts `{name,email,password}` and returns `{success,message,data:{user,tokens:{accessToken,refreshToken}}}`.
- `POST /api/v1/auth/login` accepts `{email,password}` and returns the same response shape.
- `GET /api/v1/auth/me` requires `Authorization: Bearer <accessToken>` and returns `{success,message,data:<user>}`.
- `POST /api/v1/auth/refresh` accepts `{refreshToken}` and returns `{success,message,data:{accessToken,refreshToken}}` for the existing Axios interceptor.

Passwords are stored as Argon2 hashes. Authenticated profile responses never include password hashes. Refresh-token JTIs are stored in PostgreSQL and each refresh atomically consumes the previous token; multiple logins have independent refresh sessions. Configure and apply the current Alembic migrations before using authentication. After upgrading from the earlier stateless refresh implementation, users must sign in once to establish persisted refresh-token sessions. Email verification delivery, logout/revocation, and password reset remain separate work.

### Farm API

All Farm endpoints require `Authorization: Bearer <accessToken>`. They return direct farm resources (not the auth response envelope). The authenticated user owns the record; client-supplied `user_id` is rejected.

- `POST /api/v1/farms` accepts required `farm_name` and `location`, with optional `soil_type`, positive `farm_size` (at most 2 decimal places), and `water_source`; it returns `201` and the created farm.
- `GET /api/v1/farms` returns only the authenticated user's farms as a JSON array.
- `GET /api/v1/farms/{farm_id}` returns an owned farm; missing and other users' farms both return `404`.
- `PATCH /api/v1/farms/{farm_id}` applies only supplied fields. The existing frontend currently sends `PUT`, so `PUT /api/v1/farms/{farm_id}` is retained as a compatibility alias with the same partial-update behavior.
- `DELETE /api/v1/farms/{farm_id}` returns `204` on success. Farm names and locations are required; optional soil/water values may be cleared with `null`.

### Configure local PostgreSQL

Install and start PostgreSQL, then create a local database (for example, `createdb agrisense_ai`). Edit `backend/.env` and set `DATABASE_URL` to your own local connection string; URL-encode special characters in the password:

```text
DATABASE_URL=postgresql+psycopg://<user>:<URL-encoded-password>@localhost:5432/agrisense_ai
```

The checked-in `backend/.env.example` contains only a replaceable placeholder, not working credentials. With the virtual environment active and the shell in `backend/`, apply schema migrations with `alembic upgrade head`. Generate future revisions with `alembic revision --autogenerate -m "describe schema change"`, review the generated migration, then apply it with `alembic upgrade head`. Tables are not created automatically at application startup.

`GET /api/v1/health` only checks that the API process responds. `GET /api/v1/health/ready` checks database connectivity and returns HTTP 503 if `DATABASE_URL` is missing or PostgreSQL is unavailable. Neither endpoint returns connection credentials or driver errors.

Run the backend test suite from `backend/` with `python -m pytest` after activating the virtual environment. Database and authentication tests use isolated SQLite and do not require a running PostgreSQL service; run `alembic upgrade head` against a configured local PostgreSQL database to create its schema.

## Features

- Public landing page and protected dashboard with farm management, disease-image analysis, crop recommendations, weather lookup, AI chat, and reports.
- Login, registration, password reset, and email verification flows.
- Profile and device-local settings, theme support, and responsive dashboard navigation.
- AI Chat: `POST /ai-chat/message`.
- Crop Recommendation: `POST /crop-recommendation/recommend` with nitrogen, phosphorus, potassium, temperature, humidity, pH, and rainfall values.
- Weather: `GET /weather/current?location=...` and `GET /weather/forecast?location=...`.

The screens call the API and display request failures; they do not generate substitute AI, crop, or weather results. Successful report responses are cached in the browser and marked as device-local in report history.

## API routes expected by the frontend

| Feature | Method and path |
| --- | --- |
| Authentication | `POST /auth/login`, `/auth/register`, `/auth/logout`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, `/auth/resend-verification`; `GET /auth/me` |
| Farms | `GET /farms`, `POST /farms`, `GET /farms/{farmId}`, `PATCH /farms/{farmId}`, `PUT /farms/{farmId}` (frontend compatibility alias), `DELETE /farms/{farmId}` |
| Disease detection | `POST /disease-detection/analyze` (multipart image); `/disease-detection/history` is declared but not currently used |
| Crop recommendation | `POST /crop-recommendation/recommend` |
| Weather | `GET /weather/current`, `GET /weather/forecast` |
| AI chat | `/ai-chat/conversations` is declared but not currently used; `POST /ai-chat/message` |
| Reports | `GET /reports`, `POST /reports/generate` |
| User profile | `/users/profile` is declared but not currently used |

## Checks

```bash
npm run build
npm run lint
```

The component showcase is available at `/showcase` in development builds only.
