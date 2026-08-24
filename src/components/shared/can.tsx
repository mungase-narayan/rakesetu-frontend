import type { ReactNode } from 'react';

import { usePermission } from '@/hooks';
import type { Permission } from '@/types/user.types';

interface CanProps {
  /** One permission, or several. */
  permission: Permission | Permission[];
  /**
   * How several are combined. `all` is the default because it matches
   * `requirePermission(a, b)` on the server, which requires both — a gate that
   * was looser than its endpoint would show a button that always 403s.
   */
  mode?: 'all' | 'any';
  /** Rendered instead of the children when the check fails. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Declarative permission gate.
 *
 *   <Can permission="indent:approve"><Button>Approve</Button></Can>
 *   <Can permission="charge:waive" fallback={<WaiverHint />}>…</Can>
 *
 * Renders nothing by default when the check fails, which is right for an action
 * the user simply does not have. Pass a `fallback` when the absence needs
 * explaining — "requires a Commercial Officer" is more useful than a gap.
 */
const Can = ({
  permission,
  mode = 'all',
  fallback = null,
  children,
}: CanProps) => {
  const { can, canAll, canAny } = usePermission();

  const list = Array.isArray(permission) ? permission : [permission];
  const allowed =
    list.length === 1
      ? can(list[0])
      : mode === 'any'
        ? canAny(...list)
        : canAll(...list);

  return <>{allowed ? children : fallback}</>;
};

export default Can;
