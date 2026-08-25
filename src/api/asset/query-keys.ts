import type {
  ListRakesQuery,
  ListWagonTypesQuery,
  ListWagonsQuery,
} from '@/types/master-data.types';

export const assetKeys = {
  all: ['asset'] as const,

  wagonTypes: () => [...assetKeys.all, 'wagon-types'] as const,
  wagonTypeList: (params: ListWagonTypesQuery) =>
    [...assetKeys.wagonTypes(), params] as const,

  wagons: () => [...assetKeys.all, 'wagons'] as const,
  wagonList: (params: ListWagonsQuery) =>
    [...assetKeys.wagons(), params] as const,

  rakes: () => [...assetKeys.all, 'rakes'] as const,
  rakeList: (params: ListRakesQuery) => [...assetKeys.rakes(), params] as const,

  /**
   * The `at` is part of the key, and has to be: the whole point of the endpoint
   * is that the same rake has different compositions at different moments, so
   * caching them under one key would serve the past as the present.
   */
  composition: (id: string, at?: string) =>
    [...assetKeys.rakes(), id, 'composition', at ?? 'now'] as const,
};
