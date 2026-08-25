import { apiRequest } from '@/request';
import { REQUEST_METHOD } from '@/constants';
import type { ApiResponse } from '@/types/shared.types';
import type { Paginated } from '@/types/pagination.types';
import type {
  ListRakesQuery,
  ListWagonTypesQuery,
  ListWagonsQuery,
  Rake,
  RakeCompositionResponse,
  Wagon,
  WagonType,
} from '@/types/master-data.types';

const endpoint = {
  wagonTypes: '/wagon-types',
  wagonType: (code: string) => `/wagon-types/${code}`,
  wagons: '/wagons',
  wagon: (id: string) => `/wagons/${id}`,
  rakes: '/rakes',
  rake: (id: string) => `/rakes/${id}`,
  composition: (id: string) => `/rakes/${id}/composition`,
};

export type CreateWagonTypeBody = Omit<
  WagonType,
  'createdAt' | 'updatedAt' | 'isCovered'
> & { isCovered?: boolean };

export type CreateWagonBody = Omit<
  Wagon,
  | 'id'
  | 'orgId'
  | 'createdAt'
  | 'updatedAt'
  | 'status'
  | 'ownerOrgId'
  | 'builtYear'
> & {
  status?: Wagon['status'];
  ownerOrgId?: string | null;
  builtYear?: number | null;
};

/**
 * `currentState` and `currentStation` are accepted on create only, to seed the
 * first map render. The API strips them from a PATCH — from Phase 4 the event
 * projection is the only writer.
 */
export type CreateRakeBody = Omit<
  Rake,
  | 'id'
  | 'orgId'
  | 'createdAt'
  | 'updatedAt'
  | 'stateSince'
  | 'isActive'
  | 'currentState'
  | 'currentStation'
> & {
  currentState?: Rake['currentState'];
  currentStation?: string | null;
  isActive?: boolean;
};

export type UpdateRakeBody = Partial<
  Pick<
    Rake,
    'wagonTypeCode' | 'wagonCount' | 'owner' | 'homeDivision' | 'isActive'
  >
>;

export const apis = {
  getWagonTypes: ({ params }: { params: ListWagonTypesQuery }) =>
    apiRequest<ApiResponse<Paginated<WagonType>>>({
      url: endpoint.wagonTypes,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  createWagonType: ({ data }: { data: CreateWagonTypeBody }) =>
    apiRequest<ApiResponse<WagonType>>({
      url: endpoint.wagonTypes,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  updateWagonType: ({
    code,
    data,
  }: {
    code: string;
    data: Partial<CreateWagonTypeBody>;
  }) =>
    apiRequest<ApiResponse<WagonType>>({
      url: endpoint.wagonType(code),
      method: REQUEST_METHOD.PATCH,
      data: data as unknown as Record<string, unknown>,
    }),

  getWagons: ({ params }: { params: ListWagonsQuery }) =>
    apiRequest<ApiResponse<Paginated<Wagon>>>({
      url: endpoint.wagons,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  createWagon: ({ data }: { data: CreateWagonBody }) =>
    apiRequest<ApiResponse<Wagon>>({
      url: endpoint.wagons,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  updateWagon: ({ id, data }: { id: string; data: Partial<CreateWagonBody> }) =>
    apiRequest<ApiResponse<Wagon>>({
      url: endpoint.wagon(id),
      method: REQUEST_METHOD.PATCH,
      data: data as unknown as Record<string, unknown>,
    }),

  getRakes: ({ params }: { params: ListRakesQuery }) =>
    apiRequest<ApiResponse<Paginated<Rake>>>({
      url: endpoint.rakes,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  createRake: ({ data }: { data: CreateRakeBody }) =>
    apiRequest<ApiResponse<Rake>>({
      url: endpoint.rakes,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  updateRake: ({ id, data }: { id: string; data: UpdateRakeBody }) =>
    apiRequest<ApiResponse<Rake>>({
      url: endpoint.rake(id),
      method: REQUEST_METHOD.PATCH,
      data: data as unknown as Record<string, unknown>,
    }),

  /** `at` is optional and defaults to now; pass it to read the past. */
  getComposition: ({ id, at }: { id: string; at?: string }) =>
    apiRequest<ApiResponse<RakeCompositionResponse>>({
      url: endpoint.composition(id),
      method: REQUEST_METHOD.GET,
      params: at ? { at } : {},
    }),

  replaceComposition: ({
    id,
    wagonIds,
    effectiveFrom,
  }: {
    id: string;
    wagonIds: string[];
    effectiveFrom?: string;
  }) =>
    apiRequest<ApiResponse<RakeCompositionResponse['composition']>>({
      url: endpoint.composition(id),
      method: REQUEST_METHOD.PUT,
      data: { wagonIds, effectiveFrom } as unknown as Record<string, unknown>,
    }),
};
