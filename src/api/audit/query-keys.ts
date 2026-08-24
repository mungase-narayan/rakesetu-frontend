import type { ListAuditQuery } from '@/types/audit.types';

export const auditKeys = {
  all: ['audit'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (params: ListAuditQuery) => [...auditKeys.lists(), params] as const,
  entities: () => [...auditKeys.all, 'entity'] as const,
  entity: (entityType: string, entityId: string) =>
    [...auditKeys.entities(), entityType, entityId] as const,
};
