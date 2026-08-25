import type { ListDocumentsQuery } from '@/types/master-data.types';

export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (params: ListDocumentsQuery) =>
    [...documentKeys.lists(), params] as const,
  // No key for a download URL. It is a credential with a fifteen-minute life,
  // and a cache is exactly the wrong place for one.
};
