/**
 * Every route path in the application, in one place.
 *
 * No component holds a route string literal. That is not tidiness: the route
 * tree gains six workspaces in this phase and roughly forty screens across the
 * ones that follow, and a renamed segment must be a compile error in every
 * `<NavLink>` and `navigate()` that points at it rather than a link that
 * silently starts resolving to the 404 page.
 *
 * The shape mirrors the tree itself — `ROUTES.admin.users` is `/app/admin/users`
 * — so reading this file tells you the information architecture.
 */
const APP = '/app';

export const ROUTES = {
  home: '/',

  auth: {
    root: '/auth',
    login: '/auth/login',
    forgotPassword: '/auth/forgot-password',
    /**
     * Token-bearing paths. The functions build a link; the `*Pattern` strings
     * are what the route tree declares. Both come from here so a rename cannot
     * leave the email pointing at a route that no longer exists — the backend
     * builds these same URLs from FRONTEND_URL.
     */
    invitationPattern: '/auth/invitation/:token',
    invitation: (token: string) =>
      `/auth/invitation/${encodeURIComponent(token)}`,
    resetPasswordPattern: '/auth/reset-password/:token',
    resetPassword: (token: string) =>
      `/auth/reset-password/${encodeURIComponent(token)}`,
  },

  app: APP,

  customer: {
    root: `${APP}/customer`,
    dashboard: `${APP}/customer/dashboard`,
  },

  controller: {
    root: `${APP}/controller`,
    dashboard: `${APP}/controller/dashboard`,
  },

  terminal: {
    root: `${APP}/terminal`,
    dashboard: `${APP}/terminal/dashboard`,
  },

  commercial: {
    root: `${APP}/commercial`,
    dashboard: `${APP}/commercial/dashboard`,
  },

  zonal: {
    root: `${APP}/zonal`,
    dashboard: `${APP}/zonal/dashboard`,
  },

  admin: {
    root: `${APP}/admin`,
    dashboard: `${APP}/admin/dashboard`,
    users: `${APP}/admin/users`,
    audit: `${APP}/admin/audit`,
  },
} as const;

/**
 * The child path a `<Route>` inside `/app` declares.
 *
 * React Router matches nested routes on the segment relative to the parent, so
 * the tree needs `"admin/users"` where a link needs `"/app/admin/users"`.
 * Deriving one from the other keeps a single source of truth.
 */
export const relativeToApp = (path: string): string =>
  path.startsWith(`${APP}/`) ? path.slice(APP.length + 1) : path;

export default ROUTES;
