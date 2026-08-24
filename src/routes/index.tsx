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
            </Route>

            <Route
              path="terminal"
              element={<RoleLayout role="terminal_supervisor" />}
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TerminalDashboard />} />
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
            </Route>

            <Route path="admin" element={<RoleLayout role="admin" />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="audit" element={<AuditPage />} />
            </Route>
          </Route>

          {/* Catch-all: unmatched routes render the 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
