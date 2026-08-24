import { useMemo } from 'react';

import { useAuth } from '@/hooks';
import type { Permission } from '@/types/user.types';

/**
 * "May this person do X?" — answered from the list `GET /users/me` returned.
 *
 * **Hiding a button is not security.** Every action this gates is already
 * behind `requirePermission(...)` on the server; this hook exists so the UI
 * does not offer work that will come back a 403. Treat a `can()` of `false` as
 * a presentation decision, never as the enforcement point.
 */
export const usePermission = () => {
  const { permissions } = useAuth();

  const granted = useMemo(
    () => new Set<Permission>(permissions ?? []),
    [permissions]
  );

  return useMemo(
    () => ({
      /** Holds this exact permission. */
      can: (permission: Permission) => granted.has(permission),
      /** Holds at least one of them — an OR over alternatives. */
      canAny: (...list: Permission[]) => list.some((p) => granted.has(p)),
      /** Holds every one of them — matches the backend's AND semantics. */
      canAll: (...list: Permission[]) => list.every((p) => granted.has(p)),
      permissions: granted,
    }),
    [granted]
  );
};

export default usePermission;
