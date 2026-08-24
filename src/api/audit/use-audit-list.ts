import { useQuery } from '@tanstack/react-query';

import { apis } from './apis';
import { auditKeys } from './query-keys';
import type { ListAuditQuery } from '@/types/audit.types';

export const useAuditList = (params: ListAuditQuery = {}, enabled = true) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => apis.getAuditList({ params }),
    select: (res) => res.data.data,
    enabled,
  });

  return {
    entries: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};
