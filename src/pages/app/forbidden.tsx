import { Link } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShieldKeyIcon } from '@hugeicons/core-free-icons';

import { useAuth } from '@/hooks';
import { handleNavigate } from '@/lib/utils';
import { USER_ROLE_LABELS } from '@/constants';
import { Button } from '@/components/ui/button';
import type { UserRoleType } from '@/types/user.types';

interface ForbiddenProps {
  /** The workspace that was refused, when the guard knows it. */
  requiredRole?: UserRoleType;
}

/**
 * 403, as a screen rather than a redirect.
 *
 * Bouncing to `/auth/login` would be the easy implementation and the wrong
 * message: it tells a signed-in person that their session ended, so they sign
 * in again with the same account and are bounced again. The honest answer is
 * "you are who you say you are, and this is not yours" — with a way back to
 * somewhere that *is*.
 */
const Forbidden = ({ requiredRole }: ForbiddenProps) => {
  const { roles, activeRole } = useAuth();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10">
        <HugeiconsIcon
          icon={ShieldKeyIcon}
          size={28}
          strokeWidth={1.8}
          className="text-destructive"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-destructive uppercase">
          403 — Forbidden
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          This workspace is not yours
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          {requiredRole
            ? `Reaching this area needs the ${USER_ROLE_LABELS[requiredRole]} role.`
            : 'Your account does not hold the role this area needs.'}{' '}
          You are signed in
          {roles.length > 0 && (
            <>
              {' '}
              as{' '}
              <span className="font-medium text-foreground">
                {roles.map((role) => USER_ROLE_LABELS[role.name]).join(' · ')}
              </span>
            </>
          )}
          . Nothing is wrong with your session — an administrator grants roles.
        </p>
      </div>

      <Button asChild>
        <Link to={handleNavigate(roles, activeRole)}>Back to my workspace</Link>
      </Button>
    </div>
  );
};

export default Forbidden;
