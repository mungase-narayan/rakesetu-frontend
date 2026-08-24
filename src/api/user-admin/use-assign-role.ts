import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apis } from './apis';
import { userAdminKeys } from './query-keys';
import { auditKeys } from '@/api/audit';
import type { AssignRoleBody } from '@/types/user-admin.types';

export const useAssignRole = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignRoleBody }) =>
      apis.assignRole({ id, data }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: userAdminKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userAdminKeys.detail(variables.id),
      });
      // The grant just wrote an audit row; the viewer should not need a reload
      // to show it.
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    },
    retry: false,
  });

  return { assignRole: mutate, isLoading: isPending };
};
