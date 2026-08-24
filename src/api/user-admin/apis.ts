import { apiRequest } from '@/request';
import { REQUEST_METHOD } from '@/constants';
import type { ApiResponse } from '@/types/shared.types';
import type { Paginated } from '@/types/pagination.types';
import type {
  AdminUser,
  AssignRoleBody,
  CreateUserBody,
  ListUsersQuery,
  UpdateUserBody,
} from '@/types/user-admin.types';

const endpoint = {
  users: '/users',
  user: (id: string) => `/users/${id}`,
  roles: (id: string) => `/users/${id}/roles`,
  role: (id: string, userRoleId: string) => `/users/${id}/roles/${userRoleId}`,
};

export const apis = {
  getUserList: ({ params }: { params: ListUsersQuery }) =>
    apiRequest<ApiResponse<Paginated<AdminUser>>>({
      url: endpoint.users,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  getUser: ({ id }: { id: string }) =>
    apiRequest<ApiResponse<AdminUser>>({
      url: endpoint.user(id),
      method: REQUEST_METHOD.GET,
    }),

  createUser: ({ data }: { data: CreateUserBody }) =>
    apiRequest<ApiResponse<AdminUser>>({
      url: endpoint.users,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  updateUser: ({ id, data }: { id: string; data: UpdateUserBody }) =>
    apiRequest<ApiResponse<AdminUser>>({
      url: endpoint.user(id),
      method: REQUEST_METHOD.PATCH,
      data: data as unknown as Record<string, unknown>,
    }),

  assignRole: ({ id, data }: { id: string; data: AssignRoleBody }) =>
    apiRequest<ApiResponse<AdminUser>>({
      url: endpoint.roles(id),
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  revokeRole: ({ id, userRoleId }: { id: string; userRoleId: string }) =>
    apiRequest<ApiResponse<AdminUser>>({
      url: endpoint.role(id, userRoleId),
      method: REQUEST_METHOD.DELETE,
    }),
};
