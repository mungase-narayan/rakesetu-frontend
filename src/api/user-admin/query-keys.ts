import type { ListUsersQuery } from '@/types/user-admin.types';

export const userAdminKeys = {
  all: ['user-admin'] as const,
  lists: () => [...userAdminKeys.all, 'list'] as const,
  list: (params: ListUsersQuery) => [...userAdminKeys.lists(), params] as const,
  details: () => [...userAdminKeys.all, 'detail'] as const,
  detail: (id: string) => [...userAdminKeys.details(), id] as const,
};
