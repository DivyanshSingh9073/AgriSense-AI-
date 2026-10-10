# AgriSense AI

AgriSense AI is a React 19, TypeScript, and Vite precision-agriculture frontend. It uses React Router for public, authentication, and protected dashboard routes; shared layouts and UI components; Axios feature services; and React Hook Form/Zod for validated forms.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` to the backend API root. The example value is `http://localhost:5000/api/v1`. `VITE_APP_ENV` accepts `development`, `staging`, or `production`.

The repository includes a FastAPI backend foundation with health checks, SQLAlchemy models, and Alembic migrations. Its local API base URL is `http://localhost:5000/api/v1`, matching the frontend example. Feature API routes are not implemented yet.

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

### Configure local PostgreSQL

Install and start PostgreSQL, then create a local database (for example, `createdb agrisense_ai`). Edit `backend/.env` and set `DATABASE_URL` to your own local connection string; URL-encode special characters in the password:

```text
DATABASE_URL=postgresql+psycopg://<user>:<URL-encoded-password>@localhost:5432/agrisense_ai
```

The checked-in `backend/.env.example` contains only a replaceable placeholder, not working credentials. With the virtual environment active and the shell in `backend/`, apply schema migrations with `alembic upgrade head`. Generate future revisions with `alembic revision --autogenerate -m "describe schema change"`, review the generated migration, then apply it with `alembic upgrade head`. Tables are not created automatically at application startup.

`GET /api/v1/health` only checks that the API process responds. `GET /api/v1/health/ready` checks database connectivity and returns HTTP 503 if `DATABASE_URL` is missing or PostgreSQL is unavailable. Neither endpoint returns connection credentials or driver errors.

Run the backend test suite from `backend/` with `python -m pytest` after activating the virtual environment. Database tests use SQLite or mocks and do not require a running PostgreSQL service. Authentication and AI features are not implemented.

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
| Farms | `GET /farms`, `POST /farms`, `PUT /farms/{farmId}`, `DELETE /farms/{farmId}` |
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
# AgriSense AI — Precision Agriculture Platform

Foundation scaffold: React 19 + TypeScript + Vite + Tailwind CSS + React Router DOM + Framer Motion + React Hook Form + Zod + Recharts + Axios.

The frontend setup includes routing, layouts, a reusable UI kit, theming, and feature pages. Backend feature APIs are not implemented yet.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

## Folder structure

```
src/
├── assets/            Static images/icons imported by components
├── components/
│   ├── ui/             Design-system primitives (Button, Card, Input, Modal, Badge, Avatar, Spinner, Alert)
│   ├── layout/          Structural chrome shared by layouts (Navbar, Sidebar, Topbar, Footer)
│   └── common/           Small cross-page helpers (e.g. PageContainer scaffold)
├── layouts/            Route-level shells: MainLayout, AuthLayout, DashboardLayout
├── pages/              One folder per route, each exporting a single page component
├── routes/             AppRoutes tree + ProtectedRoute guard
├── constants/           ROUTES, COLORS, navigation config, APP_CONFIG — no magic strings
├── services/api/         Axios instance + endpoint path constants
├── context/             React Context providers (ThemeContext)
├── hooks/               Custom hooks (useTheme, more to come)
├── types/               Shared TypeScript types
├── utils/               Small pure helpers (cn = clsx + tailwind-merge)
└── styles/globals.css    Tailwind layers, CSS variable theme tokens, base + utility classes
```

See the full explanation of *why* each folder exists in the setup conversation / project docs.

## Design tokens

Colors, type scale, and radii are defined once as CSS variables in `src/styles/globals.css`
and mapped into Tailwind in `tailwind.config.ts`. Dark mode is class-based (`.dark` on `<html>`),
toggled by `ThemeContext` / `useTheme()`, and persisted to `localStorage`.

Chart-safe hex values (for Recharts, which can't read Tailwind classes) live in
`src/constants/colors.ts` and are kept in sync with the CSS variables by convention.

## Routing

All paths are centralized in `src/constants/routes.ts` (`ROUTES`). `src/routes/AppRoutes.tsx`
nests three layout branches — public, auth, and the protected dashboard — so each layout
mounts once per branch rather than once per page.
