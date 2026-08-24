import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apis } from './apis';
import { authKeys } from './query-keys';
import type { UpdateMyAccountBody } from '@/types/user.types';

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: ({ data }: { data: UpdateMyAccountBody }) =>
      apis.updateMe({ data }),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });

  return { isLoading: isPending, updateMe: mutate };
};
