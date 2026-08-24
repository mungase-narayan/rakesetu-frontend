# rakesetu-frontend

Web client for **RakeSetu** — Freight Operations & Rake Turnaround Intelligence Platform.

React 19 · Vite · TypeScript · TanStack Query · Redux Toolkit · Tailwind CSS 4 · shadcn/ui.

> Architecture and the full product design live in [`../docs/DESIGN.md`](../docs/DESIGN.md).

## What exists today

A **public landing page**, **authentication**, and the **application shell**: six
per-role workspaces behind route guards, a permission-filtered sidebar driven by
config rather than JSX branching, and two real admin screens — users & roles and
the audit log viewer.

The freight modules themselves (allotment board, rake timeline, network map,
charge explainer, copilot) are designed but not yet built. Each workspace says so
in place: a dashboard tile either shows a live number or names the phase that
will fill it, and a sidebar entry for an unbuilt screen renders disabled with its
phase number rather than linking somewhere that 404s. Nothing on any dashboard is
a hardcoded figure dressed as data.

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

| Path                   | Guard                 | What it is                                               |
| ---------------------- | --------------------- | -------------------------------------------------------- |
| `/`                    | public                | Landing page                                             |
| `/auth/login`          | public-only           | Sign in (signed-in users are bounced to their workspace) |
| `/app`                 | authenticated         | Redirects to the signed-in user's own workspace          |
| `/app/customer/*`      | `freight_customer`    | Consignment overview                                     |
| `/app/controller/*`    | `freight_controller`  | Freight control                                          |
| `/app/terminal/*`      | `terminal_supervisor` | Terminal operations                                      |
| `/app/commercial/*`    | `commercial_officer`  | Commercial desk                                          |
| `/app/zonal/*`         | `zonal_manager`       | Zonal performance (read-only)                            |
| `/app/admin/dashboard` | `admin`               | Administration                                           |
| `/app/admin/users`     | `admin`               | Users & roles                                            |
| `/app/admin/audit`     | `admin`               | Audit log viewer                                         |
| `*`                    | —                     | 404                                                      |

Every path is a constant in [`src/routes/route-paths.ts`](src/routes/route-paths.ts);
no component holds a route string literal. `ROLE_HOME` in
[`src/lib/utils.ts`](src/lib/utils.ts) maps each of the six roles to its own
landing path, and `handleNavigate` prefers `activeRole` over the first grant so a
multi-role user stays in the workspace they chose.

Two rules the guards follow:

- **An admin may enter every tree.** They already hold every permission the
  server checks, so locking them out of five of six workspaces would be a
  UI-only restriction with no security value.
- **Failing a guard renders a 403 screen, never a redirect to login.** A redirect
  tells a signed-in person their session ended, so they sign in again with the
  same account and are bounced again.

## Permissions in the UI

`GET /users/me` returns the resolved permission union for the signed-in user,
computed server-side by the same `ROLE_PERMISSIONS` map that `requirePermission`
enforces. The client is told the answer rather than recomputing it, so the map
exists in one language.

```tsx
const { can, canAny, canAll } = usePermission();
can('charge:waive');

<Can permission="indent:approve"><Button>Approve</Button></Can>
<Can permission="charge:waive" fallback={<WaiverHint />}>…</Can>
```

**Hiding a button is not security.** Every action these gate is guarded
independently on the server; `<Can>` exists so the UI does not offer work that
will come back a 403.

## Invitations and password resets

Three public screens, all built on a token in the URL:

- `/auth/invitation/:token` — an invited person sets their first password, which
  activates the account
- `/auth/forgot-password` — request a reset link
- `/auth/reset-password/:token` — choose a new one

The links are **emailed** — there is no copy-the-link dialog. An earlier version
showed one when the API had no mail transport, which put a password-setting
credential in the browser; `docker compose up -d mailpit` supplies a real local
inbox instead. Because the send is asynchronous, the admin screens never claim
delivery: the users table shows the state of the last invitation from
`email_jobs` beside the account's own "invitation pending" hint.

Two decisions worth knowing:

- **The link is validated before the form renders.** A person who types and
  confirms a password only to be told the link died three days ago has done the
  work twice for nothing.
- **The token routes sit outside `AuthLayout`.** That layout bounces a signed-in
  visitor to their workspace, which is right for the login form and wrong here —
  an admin who is already signed in and clicks an invitation meant for somebody
  else must land on that link's page, not be redirected away from it.

The password policy in `pages/auth/schema.ts` mirrors the backend validator and
is shown as it is met rather than reported after a rejection. Somebody setting a
first password has no way to guess the rules, and telling them only once they
have failed is a worse version of telling them up front.

## The shared table stack

Every list screen from here on follows the same three-state body:

```tsx
isLoading ? (
  <TableSkeleton />
) : !rows.length ? (
  <TableEmptyState />
) : (
  <DataTable />
);
```

with `<TablePagination>` reading the server's `pagination` envelope beneath it.
`DataTable` is built on `@tanstack/react-table` **v9**, whose features are
opt-in — and the omissions are deliberate. There is no pagination feature: the
rows handed in are one server page, and a client pager would count the twenty
rows in memory rather than the four thousand in the tenant.

`<IstTime>` is the one component that renders a timestamp. DESIGN.md §7's
convention is that everything internal stays UTC and everything a person reads
is IST **with the label**; a screen that formats a date with the browser's local
zone is right on the developer's laptop and wrong in production, and a demurrage
clock four hours out is a billing dispute.

## Environment variables

| Variable                | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `VITE_NODE_ENV`         | `development` / `staging` / `production`        |
| `VITE_APP_NAME`         | Document title (substituted into `index.html`)  |
| `VITE_APP_LOGO`         | Logo path                                       |
| `VITE_APP_FAVICON_LOGO` | Favicon path                                    |
| `VITE_BACKEND_URL`      | API origin; `/api/v1` is appended automatically |

## Scripts

| Script                     | What it does                     |
| -------------------------- | -------------------------------- |
| `pnpm dev`                 | Vite dev server on :5175         |
| `pnpm build`               | Production build to `dist/`      |
| `pnpm build:check`         | Type-check, then build           |
| `pnpm type-check`          | `tsc -b`                         |
| `pnpm test` / `test:watch` | Vitest + Testing Library (jsdom) |
| `pnpm lint` / `lint:fix`   | ESLint (zero warnings allowed)   |
| `pnpm format`              | Prettier                         |
| `pnpm preview`             | Serve the built bundle           |

## Project structure

```
src/
  main.tsx · App.tsx        Entry + provider stack
  index.css                 Tailwind 4 theme tokens (rail steel-blue palette)
  api/auth/                 apis.ts · query-keys.ts · one use-*.ts per operation
  api/user-admin/           Same shape, for /users
  api/audit/                Same shape, for /audit
  components/ui/            shadcn primitives (32)
  components/shared/        DataTable · IstTime · Can · CsvExport · StatTile · …
  components/shell/         App header · sidebar · role switcher
  constants/                app-env · constants · user roles · navigation
  hooks/                    use-auth · use-permission · use-sidebar-state · …
  lib/                      cn, role routing, IST formatting, toasts
  pages/
    home/                   Landing page — a shell plus one file per section
    auth/login/             Login — a shell plus one file per field
    app/
      layout.tsx            Auth gate + header + sidebar for every /app route
      role-layout.tsx       Per-workspace guard
      forbidden.tsx         403 screen
      <role>/dashboard/     Six workspace dashboards
      admin/users/          Users & roles
      admin/audit/          Audit log viewer
    not-found/              404
  providers/                Theme provider
  request/                  Axios instance, interceptors, error toasts
  routes/                   Route tree + route-paths.ts
  store/                    Redux Toolkit + redux-persist
  test/                     Vitest setup + renderWithProviders
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
6. `ProtectedLayout` calls `GET /users/me` and re-syncs the persisted profile —
   there rather than on one dashboard, so a revoked role reaches the sidebar
   from wherever the user happens to be standing.
