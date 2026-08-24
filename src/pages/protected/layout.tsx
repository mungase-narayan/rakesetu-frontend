import { Navigate, Outlet } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Moon02Icon,
  Sun03Icon,
  Logout03Icon,
} from '@hugeicons/core-free-icons';

import { useAuth, useLogout, useTheme } from '@/hooks';
import { AppLogo } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { initialsOf } from '@/lib/utils';
import { USER_ROLE_LABELS } from '@/constants';

/**
 * Gate for every signed-in route. Unauthenticated visitors are redirected to
 * the login screen; the redirect happens here rather than in each page so a
 * new page cannot forget it.
 */
const ProtectedLayout = () => {
  const { isAuth, user, organization, roles } = useAuth();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();

  if (!isAuth) return <Navigate to="/auth/login" replace />;

  const isDark = theme === 'dark';

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <AppLogo />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">
                RakeSetu
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {organization?.name ?? 'Freight Operations'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
            >
              <HugeiconsIcon
                icon={isDark ? Sun03Icon : Moon02Icon}
                size={18}
                strokeWidth={2}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 gap-2 px-2"
                  aria-label="Account menu"
                >
                  {/* Rounded square, not a circle — same silhouette as the
                      RakeSetu mark sitting at the other end of this header. */}
                  <Avatar className="h-7 w-7 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                      {initialsOf(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">
                    {user?.fullName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold">{user?.fullName}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </p>
                  {roles[0] && (
                    <p className="mt-1 text-xs font-normal text-primary">
                      {USER_ROLE_LABELS[roles[0].name]}
                    </p>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} variant="destructive">
                  <HugeiconsIcon icon={Logout03Icon} size={16} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;
