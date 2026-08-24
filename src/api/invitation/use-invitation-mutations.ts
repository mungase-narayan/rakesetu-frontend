import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apis } from './apis';
import { userAdminKeys } from '@/api/user-admin';
import { auditKeys } from '@/api/audit';
import type {
  AcceptInvitationBody,
  ForgotPasswordBody,
  ResetPasswordBody,
} from '@/types/invitation.types';

export const useAcceptInvitation = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: ({
      token,
      data,
    }: {
      token: string;
      data: AcceptInvitationBody;
    }) => apis.acceptInvitation({ token, data }),
    retry: false,
  });

  return { acceptInvitation: mutate, isLoading: isPending };
};

export const useForgotPassword = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }: { data: ForgotPasswordBody }) =>
      apis.forgotPassword({ data }),
    retry: false,
  });

  return { forgotPassword: mutate, isLoading: isPending };
};

export const useResetPassword = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: ({ token, data }: { token: string; data: ResetPasswordBody }) =>
      apis.resetPassword({ token, data }),
    retry: false,
  });

  return { resetPassword: mutate, isLoading: isPending };
};

export const useResendInvitation = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id }: { id: string }) => apis.resendInvitation({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userAdminKeys.lists() });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    },
    retry: false,
  });

  return { resendInvitation: mutate, isLoading: isPending };
};
