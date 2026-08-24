import { Navigate, Outlet } from 'react-router';

import { useAuth } from '@/hooks';
import { handleNavigate } from '@/lib/utils';

// Auth-only pages (login). Signed-in users are bounced to their workspace.
const AuthLayout = () => {
  const { isAuth, roles } = useAuth();
  if (isAuth) return <Navigate to={handleNavigate(roles)} replace />;
  return <Outlet />;
};

export default AuthLayout;
