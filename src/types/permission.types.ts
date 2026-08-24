/**
 * The permission vocabulary, mirroring the backend's
 * `src/constants/permission.constants.ts`.
 *
 * Only the *names* are mirrored — never the role→permission map. The map lives
 * on the server, and `GET /users/me` hands back the resolved union for the
 * signed-in user; duplicating the map here would give the product two answers
 * to "may this person waive a charge" and no way to notice when they disagree.
 * This list exists so `can("charge:waive")` is a compile error when misspelt
 * rather than a silently-always-false check.
 */
export const PERMISSIONS = [
  'indent:create',
  'indent:read',
  'indent:approve',
  'indent:cancel',

  'rake:read',
  'rake:event:create',
  'rake:allot',
  'rake:override',

  'terminal:read',
  'terminal:log',

  'charge:read',
  'charge:compute',
  'charge:waive',
  'invoice:issue',
  'rate:quote',

  'masterdata:read',
  'masterdata:write',
  'embargo:write',

  'analytics:read',

  'user:read',
  'user:write',
  'audit:read',

  'ai:invoke',
  'ai:review',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
