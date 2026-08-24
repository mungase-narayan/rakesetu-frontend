import type { PaginationParams } from './pagination.types';
import type { UserRoleType } from './user.types';

/**
 * One row of the append-only trail, mirroring the backend `audit_log` table.
 *
 * `before`/`after` are `unknown` on purpose: each action writes the narrow pair
 * of fields *it* changed, so there is no one shape to type. The diff view walks
 * the two objects key by key rather than expecting a schema.
 */
export interface AuditEntry {
  id: string;
  orgId: string;
  at: string;
  actorId: string | null;
  actorRole: UserRoleType | null;
  action: string;
  entityType: string;
  entityId: string;
  before: unknown;
  after: unknown;
  ip: string | null;
  correlationId: string | null;
}

export interface ListAuditQuery extends PaginationParams {
  entityType?: string;
  entityId?: string;
  actorId?: string;
  action?: string;
  /** One request's whole trail. */
  correlationId?: string;
  /** ISO instants. */
  from?: string;
  to?: string;
}
