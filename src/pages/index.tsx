export { default as PageLayout } from './layout';
export { default as AuthLayout } from './auth/layout';
export { default as ProtectedLayout } from './app/layout';
export { default as RoleLayout } from './app/role-layout';
export { default as ForbiddenPage } from './app/forbidden';

export { default as HomePage } from './home';
export { default as LoginPage } from './auth/login';
export { default as InvitationPage } from './auth/invitation';
export { default as ForgotPasswordPage } from './auth/forgot-password';
export { default as ResetPasswordPage } from './auth/reset-password';
export { default as NotFoundPage } from './not-found';

export { default as CustomerDashboard } from './app/customer/dashboard';
export { default as ControllerDashboard } from './app/controller/dashboard';
export { default as TerminalDashboard } from './app/terminal/dashboard';
export { default as CommercialDashboard } from './app/commercial/dashboard';
export { default as ZonalDashboard } from './app/zonal/dashboard';
export { default as AdminDashboard } from './app/admin/dashboard';
export { default as UsersPage } from './app/admin/users';
export { default as AuditPage } from './app/admin/audit';
export { default as MasterDataPage } from './app/admin/master-data';
export { default as CustomersPage } from './app/admin/customers';
export { default as DocumentsPage } from './app/admin/documents';
export { default as ChargeRulesPage } from './app/admin/charge-rules';
export { default as EmbargoesPage } from './app/controller/embargoes';

// Phase 4 — the event spine and the digital twin.
export { default as NetworkPage } from './app/controller/network';
export { default as RakesPage } from './app/controller/rakes';
export { default as RakeDetailPage } from './app/controller/rakes/detail';
export { default as ZonalNetworkPage } from './app/zonal/network';

// Phase 5 — the live read side and the terminal supervisor's workspace.
export { default as TerminalPlacementsPage } from './app/terminal/placements';
export { default as TerminalLogPage } from './app/terminal/log';
export { default as TerminalExceptionsPage } from './app/terminal/exceptions';
export { default as EtaWeightsPage } from './app/admin/eta-weights';
