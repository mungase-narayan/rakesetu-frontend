import { apiRequest } from '@/request';
import { REQUEST_METHOD } from '@/constants';
import type { ApiResponse } from '@/types/shared.types';
import type { Paginated } from '@/types/pagination.types';
import type { AuditEntry, ListAuditQuery } from '@/types/audit.types';

const endpoint = {
  audit: '/audit',
  entity: (entityType: string, entityId: string) =>
    `/audit/${entityType}/${entityId}`,
};

export const apis = {
  getAuditList: ({ params }: { params: ListAuditQuery }) =>
    apiRequest<ApiResponse<Paginated<AuditEntry>>>({
      url: endpoint.audit,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  /** One entity's full trail, oldest first — a story reads forwards. */
  getEntityTrail: ({
    entityType,
    entityId,
  }: {
    entityType: string;
    entityId: string;
  }) =>
    apiRequest<ApiResponse<AuditEntry[]>>({
      url: endpoint.entity(entityType, entityId),
      method: REQUEST_METHOD.GET,
    }),
};
