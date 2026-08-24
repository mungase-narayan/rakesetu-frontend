import { HugeiconsIcon } from '@hugeicons/react';
import { UserQuestion01Icon } from '@hugeicons/core-free-icons';

import { useAuth, useLogout } from '@/hooks';
import { Button } from '@/components/ui/button';

/**
 * Signed in, and nothing to be signed in to.
 *
 * A reachable state, not a theoretical one: an administrator may create an
 * account and grant its role later, and the invitation flow activates that
 * account in between. Before this screen existed, `handleNavigate` sent a
 * user holding no roles to the public landing page — so a person who had just
 * set their password, successfully, was shown the marketing site and every
 * reason to believe the sign-in had failed.
 *
 * The remedy is somebody else's to apply, so the screen says whose.
 */
const NoWorkspace = () => {
  const { user, organization } = useAuth();
  const logout = useLogout();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
        <HugeiconsIcon
          icon={UserQuestion01Icon}
          size={28}
          strokeWidth={1.8}
          className="text-primary"
        />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Your account has no workspace yet
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          You are signed in as{' '}
          <span className="font-medium text-foreground">{user?.email}</span>
          {organization?.name && <> at {organization.name}</>}, but no role has
          been granted to it yet. An administrator assigns roles — ask yours to
          add one, then sign in again.
        </p>
      </div>

      <Button variant="outline" onClick={logout}>
        Sign out
      </Button>
    </div>
  );
};

export default NoWorkspace;
