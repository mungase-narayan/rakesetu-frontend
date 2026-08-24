import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apis } from './apis';
import { userAdminKeys } from './query-keys';
import type { UpdateUserBody } from '@/types/user-admin.types';

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserBody }) =>
      apis.updateUser({ id, data }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: userAdminKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userAdminKeys.detail(variables.id),
      });
    },
    retry: false,
  });

  return { updateUser: mutate, isLoading: isPending };
};
