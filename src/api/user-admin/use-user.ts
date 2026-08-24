import { useQuery } from '@tanstack/react-query';

import { apis } from './apis';
import { userAdminKeys } from './query-keys';

export const useUser = (id: string, enabled = true) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: userAdminKeys.detail(id),
    queryFn: () => apis.getUser({ id }),
    select: (res) => res.data.data,
    enabled: enabled && Boolean(id),
  });

  return { user: data, isLoading, isError };
};
