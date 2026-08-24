# rakesetu-frontend

Web client for **RakeSetu** — Freight Operations & Rake Turnaround Intelligence Platform.

React 19 · Vite · TypeScript · TanStack Query · Redux Toolkit · Tailwind CSS 4 · shadcn/ui.

> Architecture and the full product design live in [`../docs/DESIGN.md`](../docs/DESIGN.md).

## What exists today

The first scaffold pass: a **public landing page** and **authentication**. Signing
in lands on a placeholder workspace that proves the session loop end to end. The
freight modules (allotment board, rake timeline, network map, charge explainer,
copilot) are designed but not yet built.

## Quick start

The backend must be running first — see [`../rakesetu-backend`](../rakesetu-backend).

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Opens on <http://localhost:5175>. Sign in with any seeded account, e.g.
`controller@rakesetu.dev` / `Rakesetu@123`.

### Package manager: pnpm, not npm

This project installs with **pnpm** — the same as `college-level-frontend`, and
for the same reason: a content-addressed store plus hard links makes a warm
install roughly a second instead of tens of them, and the strict `node_modules`
layout stops code importing packages it never declared.

```bash
corepack enable          # once; pins pnpm to the "packageManager" field
pnpm install             # never `npm install`
```

`pnpm-lock.yaml` is the lockfile and is committed. There is deliberately **no**
`package-lock.json`; running `npm install` would create one and the two would
drift apart. If you find one, delete it and run `pnpm install`.

| npm                    | pnpm                                           |
| ---------------------- | ---------------------------------------------- |
| `npm install`          | `pnpm install`                                 |
| `npm install <pkg>`    | `pnpm add <pkg>`                               |
| `npm install -D <pkg>` | `pnpm add -D <pkg>`                            |
| `npm uninstall <pkg>`  | `pnpm remove <pkg>`                            |
| `npm run <script>`     | `pnpm <script>`                                |
| `npx <bin>`            | `pnpm exec <bin>` (or `pnpm dlx` for one-offs) |
| `npm ci`               | `pnpm install --frozen-lockfile`               |

The backend stays on npm — it is a Node server with a different deploy path, and
mixing the two inside one project is what causes lockfile drift, not using a
different one per project.

## Routes

| Path             | Guard         | What it is                                               |
| ---------------- | ------------- | -------------------------------------------------------- |
| `/`              | public        | Landing page                                             |
| `/auth/login`    | public-only   | Sign in (signed-in users are bounced to their workspace) |
| `/app/dashboard` | authenticated | Placeholder workspace                                    |
| `*`              | —             | 404                                                      |

`ROLE_HOME` in [`src/lib/utils.ts`](src/lib/utils.ts) maps each of the six roles
to a landing path. All six currently resolve to `/app/dashboard`; when a
per-role area is built, change its entry there and nothing in the login flow
has to move.

## Environment variables

| Variable                | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `VITE_NODE_ENV`         | `development` / `staging` / `production`        |
| `VITE_APP_NAME`         | Document title (substituted into `index.html`)  |
| `VITE_APP_LOGO`         | Logo path                                       |
| `VITE_APP_FAVICON_LOGO` | Favicon path                                    |
| `VITE_BACKEND_URL`      | API origin; `/api/v1` is appended automatically |

## Scripts

| Script                   | What it does                   |
| ------------------------ | ------------------------------ |
| `pnpm dev`               | Vite dev server on :5175       |
| `pnpm build`             | Production build to `dist/`    |
| `pnpm build:check`       | Type-check, then build         |
| `pnpm type-check`        | `tsc -b`                       |
| `pnpm lint` / `lint:fix` | ESLint (zero warnings allowed) |
| `pnpm format`            | Prettier                       |
| `pnpm preview`           | Serve the built bundle         |

## Project structure

```
src/
  main.tsx · App.tsx        Entry + provider stack
  index.css                 Tailwind 4 theme tokens (rail steel-blue palette)
  api/auth/                 apis.ts · query-keys.ts · one use-*.ts per operation
  components/ui/            shadcn primitives
  components/shared/        App-wide shared components
  constants/                app-env · constants · user roles
  hooks/                    use-auth · use-logout · use-theme · use-debounce
  lib/                      cn, role routing, formatting, toasts
  pages/
    home/                   Landing page — a shell plus one file per section
    auth/login/             Login — a shell plus one file per field
    protected/layout.tsx    Auth gate + top bar for every signed-in route
    dashboard/              Placeholder workspace
    not-found/              404
  providers/                Theme provider
  request/                  Axios instance, interceptors, error toasts
  routes/                   Route tree
  store/                    Redux Toolkit + redux-persist
  types/                    Mirrors of the backend DTOs
```

### How auth is wired

1. `useLogin` posts to `/users/login`.
2. On success the reducer `setAuth` stores user, organization, roles and tokens;
   `redux-persist` writes them to `localStorage` under `persist:rakesetu`.
3. The axios request interceptor attaches `Authorization: Bearer <token>`; the
   backend also sets httpOnly cookies, so either path works.
4. The response interceptor turns any error into a toast, and force-signs-out on
   a `401`.
5. `ProtectedLayout` gates every `/app/*` route; `AuthLayout` bounces
   already-signed-in users away from `/auth/login`.
6. The dashboard calls `GET /users/me` on mount and re-syncs the persisted
   profile, so a role change or a deactivated account is caught on next visit.
