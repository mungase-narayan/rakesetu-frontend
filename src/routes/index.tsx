import { BrowserRouter, Routes, Route, Navigate } from 'react-router';

import {
  PageLayout,
  AuthLayout,
  ProtectedLayout,
  RoleLayout,
  HomePage,
  LoginPage,
  InvitationPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  NotFoundPage,
  CustomerDashboard,
  ControllerDashboard,
  TerminalDashboard,
  CommercialDashboard,
  ZonalDashboard,
  AdminDashboard,
  UsersPage,
  AuditPage,
  MasterDataPage,
  CustomersPage,
  DocumentsPage,
  ChargeRulesPage,
  EmbargoesPage,
  NetworkPage,
  RakesPage,
  RakeDetailPage,
  ZonalNetworkPage,
  TerminalPlacementsPage,
  TerminalLogPage,
  TerminalExceptionsPage,
  EtaWeightsPage,
} from '@/pages';

import AppIndexRedirect from './app-index-redirect';

/**
 * The route tree: one public branch, one auth branch, and six role trees under
 * `/app`.
 *
 * Later phases add screens **inside** an owning role tree and never a seventh
 * top-level branch. That constraint is what keeps `RoleLayout` the single place
 * a workspace boundary is enforced — a screen added under `controller/` is
 * guarded by having been put there, not by remembering to guard it.
 */
export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageLayout />}>
          <Route index element={<HomePage />} />

          {/* Public-only - AuthLayout bounces signed-in users away */}
          <Route path="auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/*
            Token-bearing routes sit OUTSIDE AuthLayout on purpose. It bounces
            a signed-in visitor to their workspace, which is right for the login
            form and wrong here: an admin who is already signed in and clicks an
            invitation link meant for somebody else must land on that link's
            page, not be silently redirected away from it.
          */}
          <Route path="auth/invitation/:token" element={<InvitationPage />} />
          <Route
            path="auth/reset-password/:token"
            element={<ResetPasswordPage />}
          />

          {/* Signed-in area - ProtectedLayout gates auth and draws the shell */}
          <Route path="app" element={<ProtectedLayout />}>
            <Route index element={<AppIndexRedirect />} />

            <Route
              path="customer"
              element={<RoleLayout role="freight_customer" />}
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CustomerDashboard />} />
            </Route>

            <Route
              path="controller"
              element={<RoleLayout role="freight_controller" />}
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ControllerDashboard />} />
              {/*
                Embargoes live in the controller tree, not the admin one. §7
                makes declaring an embargo an operating decision, and putting
                the screen here is what guards it — RoleLayout is the boundary.
              */}
              <Route path="embargoes" element={<EmbargoesPage />} />
              {/*
                Phase 4. The map and the fleet list are operating screens, so
                they sit in the controller tree — RoleLayout is what guards
                them, and the zonal manager gets its own copy under `zonal/`
                rather than a link into somebody else's workspace.
              */}
              <Route path="network" element={<NetworkPage />} />
              <Route path="rakes" element={<RakesPage />} />
              <Route path="rakes/:rakeId" element={<RakeDetailPage />} />
            </Route>

            <Route
              path="terminal"
              element={<RoleLayout role="terminal_supervisor" />}
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TerminalDashboard />} />
              {/*
                Phase 5. The supervisor becomes fully usable here: what is
                standing on the line, the quick entry that writes the events
                every downstream number is computed from, and the exceptions
                Phase 10 will adjudicate waivers against.
              */}
              <Route path="placements" element={<TerminalPlacementsPage />} />
              <Route path="log" element={<TerminalLogPage />} />
              <Route path="exceptions" element={<TerminalExceptionsPage />} />
            </Route>

            <Route
              path="commercial"
              element={<RoleLayout role="commercial_officer" />}
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CommercialDashboard />} />
            </Route>

            <Route path="zonal" element={<RoleLayout role="zonal_manager" />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ZonalDashboard />} />
              <Route path="network" element={<ZonalNetworkPage />} />
            </Route>

            <Route path="admin" element={<RoleLayout role="admin" />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="audit" element={<AuditPage />} />
              <Route path="master-data" element={<MasterDataPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="charge-rules" element={<ChargeRulesPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="eta-weights" element={<EtaWeightsPage />} />
            </Route>
          </Route>

          {/* Catch-all: unmatched routes render the 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
