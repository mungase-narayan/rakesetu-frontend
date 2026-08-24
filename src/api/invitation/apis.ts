import { apiRequest } from '@/request';
import { REQUEST_METHOD } from '@/constants';
import type { ApiResponse } from '@/types/shared.types';
import type {
  AcceptInvitationBody,
  ForgotPasswordBody,
  InvitationResult,
  ResetPasswordBody,
  TokenPreview,
} from '@/types/invitation.types';

const endpoint = {
  invitation: (token: string) =>
    `/users/invitations/${encodeURIComponent(token)}`,
  accept: (token: string) =>
    `/users/invitations/${encodeURIComponent(token)}/accept`,
  forgot: '/users/password/forgot',
  reset: (token: string) =>
    `/users/password/reset/${encodeURIComponent(token)}`,
  resend: (id: string) => `/users/${id}/invite`,
};

export const apis = {
  previewInvitation: ({ token }: { token: string }) =>
    apiRequest<ApiResponse<TokenPreview>>({
      url: endpoint.invitation(token),
      method: REQUEST_METHOD.GET,
    }),

  acceptInvitation: ({
    token,
    data,
  }: {
    token: string;
    data: AcceptInvitationBody;
  }) =>
    apiRequest<ApiResponse<{ email: string }>>({
      url: endpoint.accept(token),
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  forgotPassword: ({ data }: { data: ForgotPasswordBody }) =>
    apiRequest<ApiResponse<null>>({
      url: endpoint.forgot,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  previewReset: ({ token }: { token: string }) =>
    apiRequest<ApiResponse<TokenPreview>>({
      url: endpoint.reset(token),
      method: REQUEST_METHOD.GET,
    }),

  resetPassword: ({
    token,
    data,
  }: {
    token: string;
    data: ResetPasswordBody;
  }) =>
    apiRequest<ApiResponse<{ email: string }>>({
      url: endpoint.reset(token),
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  resendInvitation: ({ id }: { id: string }) =>
    apiRequest<ApiResponse<InvitationResult | null>>({
      url: endpoint.resend(id),
      method: REQUEST_METHOD.POST,
    }),
};
