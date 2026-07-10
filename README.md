# AgriSense AI — Precision Agriculture Platform

Foundation scaffold: React 19 + TypeScript + Vite + Tailwind CSS + React Router DOM + Framer Motion + React Hook Form + Zod + Recharts + Axios.

This commit is **project setup only** — routing, layouts, the reusable UI kit, theming, and placeholder pages. No page UI has been implemented yet.

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
