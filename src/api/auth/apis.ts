import { apiRequest } from '@/request';
import { REQUEST_METHOD } from '@/constants';
import type {
  LoginBody,
  LoginResponse,
  MeResponse,
  RefreshResponse,
  UpdateMyAccountBody,
} from '@/types/user.types';
import type { ApiResponse } from '@/types/shared.types';

const endpoint = {
  login: '/users/login',
  refresh: '/users/refresh',
  logout: '/users/logout',
  me: '/users/me',
};

export const apis = {
  login: ({ data }: { data: LoginBody }) =>
    apiRequest<ApiResponse<LoginResponse>>({
      data: data as unknown as Record<string, unknown>,
      url: endpoint.login,
      method: REQUEST_METHOD.POST,
    }),

  refresh: () =>
    apiRequest<ApiResponse<RefreshResponse>>({
      url: endpoint.refresh,
      method: REQUEST_METHOD.POST,
    }),

  logout: () =>
    apiRequest<ApiResponse<null>>({
      url: endpoint.logout,
      method: REQUEST_METHOD.POST,
    }),

  getMe: () =>
    apiRequest<ApiResponse<MeResponse>>({
      url: endpoint.me,
      method: REQUEST_METHOD.GET,
    }),

  updateMe: ({ data }: { data: UpdateMyAccountBody }) =>
    apiRequest<ApiResponse<MeResponse['user']>>({
      data: data as unknown as Record<string, unknown>,
      url: endpoint.me,
      method: REQUEST_METHOD.PATCH,
    }),
};
