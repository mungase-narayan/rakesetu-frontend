import { Navigate } from 'react-router';

import { useAuth } from '@/hooks';
import { handleNavigate } from '@/lib/utils';
import NoWorkspace from '@/pages/app/no-workspace';

/**
 * `/app` itself belongs to nobody, so it forwards to the workspace the signed-in
 * user actually holds — `activeRole` first, their first grant otherwise.
 *
 * A static `<Navigate to="dashboard">` would have to pick one role's tree for
 * everyone, and five of six users would land on a 403.
 */
const AppIndexRedirect = () => {
  const { roles, activeRole } = useAuth();

  // `handleNavigate` sends a roleless user here, so redirecting again would
  // loop. This is where that state is explained instead.
  if (!roles.length) return <NoWorkspace />;

  return <Navigate to={handleNavigate(roles, activeRole)} replace />;
};

export default AppIndexRedirect;
