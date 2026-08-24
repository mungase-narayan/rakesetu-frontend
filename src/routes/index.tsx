import { BrowserRouter, Routes, Route, Navigate } from 'react-router';

import {
  PageLayout,
  AuthLayout,
  ProtectedLayout,
  HomePage,
  LoginPage,
  DashboardPage,
  NotFoundPage,
} from '@/pages';

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
          </Route>

          {/* Signed-in area - ProtectedLayout gates auth, then renders pages */}
          <Route path="app" element={<ProtectedLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>

          {/* Catch-all: unmatched routes render the 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
