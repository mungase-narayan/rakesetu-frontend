import { useQuery } from '@tanstack/react-query';

import { apis } from './apis';
import { userAdminKeys } from './query-keys';
import type { ListUsersQuery } from '@/types/user-admin.types';

export const useUserList = (params: ListUsersQuery = {}, enabled = true) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: userAdminKeys.list(params),
    queryFn: () => apis.getUserList({ params }),
    select: (res) => res.data.data,
    enabled,
  });

  return {
    users: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};
