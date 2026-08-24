import { Outlet } from 'react-router';

import { useAuth } from '@/hooks';
import type { UserRoleType } from '@/types/user.types';

import Forbidden from './forbidden';

interface RoleLayoutProps {
  role: UserRoleType;
}

/**
 * Guards one role's subtree.
 *
 * Two rules, both deliberate:
 *
 *  - **An admin may enter every tree.** `hasRole(role) || hasRole('admin')`.
 *    The admin already holds every permission the server checks, so locking
 *    them out of five of six workspaces would be a UI-only restriction with no
 *    security value — and a demo where the administrator cannot look at the
 *    controller's screens is a worse demo.
 *  - **Failing renders 403, never a redirect to login.** See `<Forbidden>`.
 *
 * This is a *navigation* guard. It decides which screens render, not what the
 * API will do — every endpoint behind these screens is guarded independently by
 * `requirePermission` and by tenant scoping in the repository layer.
 */
const RoleLayout = ({ role }: RoleLayoutProps) => {
  const { roles } = useAuth();

  const held = new Set(roles.map((r) => r.name));
  const allowed = held.has(role) || held.has('admin');

  if (!allowed) return <Forbidden requiredRole={role} />;

  return <Outlet />;
};

export default RoleLayout;
