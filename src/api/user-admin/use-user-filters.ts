import { useState } from 'react';

import { useDebounce } from '@/hooks';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import type {
  ListUsersQuery,
  UserRoleType,
  UserStatus,
} from '@/types/user-admin.types';

import { useUserList } from './use-user-list';

const LIMIT = DEFAULT_LIMIT;

/**
 * The filter state behind the users screen.
 *
 * `search` is held twice on purpose: the raw value drives the input so typing
 * stays responsive, and the debounced value drives the query key so a
 * seven-letter name is one request instead of seven. Every filter change resets
 * to page 1, because staying on page 4 of a result set that now has two pages
 * shows an empty table and no explanation.
 */
export const useUserFilters = () => {
  const [params, setParams] = useState<ListUsersQuery>({
    page: 1,
    limit: LIMIT,
  });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);

  const query: ListUsersQuery = {
    ...params,
    search: debouncedSearch.trim() || undefined,
  };

  const { users, pagination, isLoading, isError } = useUserList(query);

  const onSearchChange = (search: string) => {
    setSearchInput(search);
    setParams((p) => ({ ...p, page: 1 }));
  };

  const onStatusChange = (status: UserStatus | '') =>
    setParams((p) => ({ ...p, status: status || undefined, page: 1 }));

  const onRoleChange = (role: UserRoleType | '') =>
    setParams((p) => ({ ...p, role: role || undefined, page: 1 }));

  const onPageChange = (page: number) => setParams((p) => ({ ...p, page }));

  const onClearFilters = () => {
    setSearchInput('');
    setParams({ page: 1, limit: LIMIT });
  };

  const hasFilters = Boolean(
    params.status || params.role || debouncedSearch.trim()
  );

  return {
    users,
    pagination,
    isLoading,
    isError,
    search: searchInput,
    status: (params.status ?? '') as UserStatus | '',
    role: (params.role ?? '') as UserRoleType | '',
    hasFilters,
    onSearchChange,
    onStatusChange,
    onRoleChange,
    onClearFilters,
    onPageChange,
  };
};
