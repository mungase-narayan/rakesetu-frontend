import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router';

import { useMe } from '@/api/auth';
import { syncProfile } from '@/store';
import { ROUTES } from '@/routes/route-paths';
import { useAuth, useIsMobile, useSidebarState } from '@/hooks';
import { AppHeader, Sidebar } from '@/components/shell';
import type { UserRoleType } from '@/types/user.types';

/**
 * Gate and frame for every signed-in route.
 *
 * The redirect for unauthenticated visitors lives here rather than in each page
 * so a new screen cannot forget it, and `GET /users/me` is re-fetched here
 * rather than on one dashboard so a revoked role or a renamed account reaches
 * the sidebar from wherever the user happens to be standing.
 */
const ProtectedLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { collapsed, toggle } = useSidebarState();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { isAuth, roles, activeRole } = useAuth();
  const { profile } = useMe(isAuth);

  useEffect(() => {
    if (profile) dispatch(syncProfile(profile));
  }, [profile, dispatch]);

  if (!isAuth) return <Navigate to={ROUTES.auth.login} replace />;

  // Which sidebar to draw.
  //
  // The URL wins over `activeRole` — an admin browsing `/app/controller/*` is
  // looking at the controller's workspace and should see the controller's
  // navigation. But only when they may actually be there: on a tree the user is
  // about to be refused, the URL's role is not theirs, and drawing its sidebar
  // would label a Freight Controller "Administrator" in the footer while the
  // 403 screen beside it says the opposite.
  const held = new Set(roles.map((role) => role.name));
  const urlRole = roleFromPath(location.pathname);
  const mayEnterUrlTree = urlRole && (held.has(urlRole) || held.has('admin'));

  const treeRole =
    (mayEnterUrlTree ? urlRole : undefined) ?? activeRole ?? roles[0]?.name;

  // True only for an admin looking at somebody else's workspace. The sidebar
  // says so rather than implying the admin holds that role.
  const visiting = Boolean(treeRole && !held.has(treeRole));

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <AppHeader onOpenMobileNav={() => setMobileOpen(true)} />

      <div className="flex">
        {treeRole && (
          <Sidebar
            role={treeRole}
            visiting={visiting}
            collapsed={collapsed}
            onToggle={toggle}
            mobileOpen={mobileOpen}
            onMobileOpenChange={setMobileOpen}
            isMobile={isMobile}
          />
        )}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

/** `/app/controller/dashboard` → `freight_controller`. */
const SEGMENT_TO_ROLE: Record<string, UserRoleType> = {
  admin: 'admin',
  zonal: 'zonal_manager',
  controller: 'freight_controller',
  terminal: 'terminal_supervisor',
  commercial: 'commercial_officer',
  customer: 'freight_customer',
};

const roleFromPath = (pathname: string): UserRoleType | undefined => {
  const segment = pathname.split('/')[2];
  return segment ? SEGMENT_TO_ROLE[segment] : undefined;
};

export default ProtectedLayout;
