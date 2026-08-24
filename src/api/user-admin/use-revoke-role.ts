import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apis } from './apis';
import { userAdminKeys } from './query-keys';
import { auditKeys } from '@/api/audit';

export const useRevokeRole = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, userRoleId }: { id: string; userRoleId: string }) =>
      apis.revokeRole({ id, userRoleId }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: userAdminKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userAdminKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    },
    retry: false,
  });

  return { revokeRole: mutate, isLoading: isPending };
};
