/**
 * The entity types and actions Phase 1 and 2 can write.
 *
 * A fixed list rather than a distinct-values query: the vocabulary is code —
 * `AuditService.record` is called with a literal at every site — so a dropdown
 * built from whatever happens to be in the table would silently shrink on a
 * freshly seeded database. Later phases append to these two arrays.
 */
export const AUDIT_ENTITY_TYPES = ['users', 'user_roles', 'refresh_tokens'];

export const AUDIT_ACTIONS = [
  'user.login',
  'user.logout',
  'user.token.refresh',
  'user.create',
  'user.update',
  'user.role.assign',
  'user.role.revoke',
];

/**
 * How an action reads to a person, and what kind of act it was.
 *
 * The raw verb (`user.role.assign`) is the durable identifier and stays visible
 * — an audit trail whose rows cannot be quoted back to the API is less useful,
 * not more. But it is a poor headline, so each one gets a plain-English title
 * and a tone. `kind` drives the diff's shape as well as its colour: a `create`
 * has no meaningful "before", and rendering one as a column of empty red cells
 * says "these values were deleted" about a row that was just born.
 */
export type AuditActionKind = 'create' | 'update' | 'delete' | 'auth';

interface ActionMeta {
  title: string;
  kind: AuditActionKind;
}

export const ACTION_META: Record<string, ActionMeta> = {
  'user.login': { title: 'Signed in', kind: 'auth' },
  'user.logout': { title: 'Signed out', kind: 'auth' },
  'user.token.refresh': { title: 'Session refreshed', kind: 'auth' },
  'user.create': { title: 'User created', kind: 'create' },
  'user.update': { title: 'User updated', kind: 'update' },
  'user.role.assign': { title: 'Role assigned', kind: 'create' },
  'user.role.revoke': { title: 'Role revoked', kind: 'delete' },
};

/** Falls back to a readable form of the verb rather than showing nothing. */
export const actionMeta = (action: string): ActionMeta => {
  const known = ACTION_META[action];
  if (known) return known;

  const last = action.split('.').pop() ?? action;
  const guessed: AuditActionKind = /create|assign|issue/.test(last)
    ? 'create'
    : /revoke|delete|cancel/.test(last)
      ? 'delete'
      : /login|logout|refresh/.test(last)
        ? 'auth'
        : 'update';

  const words = action.replace(/[._]/g, ' ');
  return {
    title: words.charAt(0).toUpperCase() + words.slice(1),
    kind: guessed,
  };
};

/** Badge classes per kind. Kept here so the table and the sheet agree. */
export const KIND_TONE: Record<AuditActionKind, string> = {
  create:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  update: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400',
  delete: 'border-destructive/30 bg-destructive/10 text-destructive',
  auth: 'border-border bg-muted text-muted-foreground',
};
