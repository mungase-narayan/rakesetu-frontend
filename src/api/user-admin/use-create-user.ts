import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apis } from './apis';
import { userAdminKeys } from './query-keys';
import type { CreateUserBody } from '@/types/user-admin.types';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }: { data: CreateUserBody }) =>
      apis.createUser({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userAdminKeys.lists() });
    },
    retry: false,
  });

  return { createUser: mutate, isLoading: isPending };
};
