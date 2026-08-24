import { useQuery } from '@tanstack/react-query';

import { apis } from './apis';
import { authKeys } from './query-keys';

/**
 * Re-validates a persisted session against the server. Redux + redux-persist
 * hold the last known profile so the UI renders instantly on reload; this
 * query is what catches a role change or a deactivated account.
 */
export const useMe = (enabled = true) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: authKeys.me(),
    queryFn: () => apis.getMe(),
    select: (res) => res.data.data,
    enabled,
    retry: false,
  });

  return {
    profile: data,
    user: data?.user,
    organization: data?.organization,
    roles: data?.roles,
    isLoading,
    isError,
  };
};
