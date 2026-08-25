import { apiRequest } from '@/request';
import { REQUEST_METHOD } from '@/constants';
import type { ApiResponse } from '@/types/shared.types';
import type { Paginated } from '@/types/pagination.types';
import type {
  ChargeableDistance,
  DistanceBasis,
  DistanceResponse,
  ListChargeableDistancesQuery,
  ListSectionsQuery,
  ListStationsQuery,
  Section,
  Station,
} from '@/types/master-data.types';

const endpoint = {
  stations: '/network/stations',
  station: (code: string) => `/network/stations/${code}`,
  sections: '/network/sections',
  section: (id: string) => `/network/sections/${id}`,
  chargeableDistances: '/network/chargeable-distances',
  distance: '/network/distance',
};

export type CreateStationBody = Omit<
  Station,
  'createdAt' | 'updatedAt' | 'isJunction'
> & { isJunction?: boolean };

export type CreateSectionBody = Omit<
  Section,
  'id' | 'createdAt' | 'updatedAt' | 'isElectrified'
> & { isElectrified?: boolean };

export type CreateChargeableDistanceBody = Omit<
  ChargeableDistance,
  'id' | 'createdAt' | 'updatedAt' | 'sourceRef'
> & { sourceRef?: string | null };

export const apis = {
  getStations: ({ params }: { params: ListStationsQuery }) =>
    apiRequest<ApiResponse<Paginated<Station>>>({
      url: endpoint.stations,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  createStation: ({ data }: { data: CreateStationBody }) =>
    apiRequest<ApiResponse<Station>>({
      url: endpoint.stations,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  updateStation: ({
    code,
    data,
  }: {
    code: string;
    data: Partial<CreateStationBody>;
  }) =>
    apiRequest<ApiResponse<Station>>({
      url: endpoint.station(code),
      method: REQUEST_METHOD.PATCH,
      data: data as unknown as Record<string, unknown>,
    }),

  getSections: ({ params }: { params: ListSectionsQuery }) =>
    apiRequest<ApiResponse<Paginated<Section>>>({
      url: endpoint.sections,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  /**
   * Takes one section or an array of them. The CSV importer sends the whole
   * file in one request — ninety separate ones would be ninety invalidations
   * of the cached network graph for a single edit.
   */
  createSections: ({
    data,
  }: {
    data: CreateSectionBody | CreateSectionBody[];
  }) =>
    apiRequest<ApiResponse<Section | Section[]>>({
      url: endpoint.sections,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  updateSection: ({
    id,
    data,
  }: {
    id: string;
    data: Partial<CreateSectionBody>;
  }) =>
    apiRequest<ApiResponse<Section>>({
      url: endpoint.section(id),
      method: REQUEST_METHOD.PATCH,
      data: data as unknown as Record<string, unknown>,
    }),

  deleteSection: ({ id }: { id: string }) =>
    apiRequest<ApiResponse<{ id: string }>>({
      url: endpoint.section(id),
      method: REQUEST_METHOD.DELETE,
    }),

  getChargeableDistances: ({
    params,
  }: {
    params: ListChargeableDistancesQuery;
  }) =>
    apiRequest<ApiResponse<Paginated<ChargeableDistance>>>({
      url: endpoint.chargeableDistances,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  createChargeableDistances: ({
    data,
  }: {
    data: CreateChargeableDistanceBody | CreateChargeableDistanceBody[];
  }) =>
    apiRequest<ApiResponse<ChargeableDistance | ChargeableDistance[]>>({
      url: endpoint.chargeableDistances,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  /**
   * `basis` is required. There is no default here for the same reason there is
   * none on the server: one of the two numbers belongs on an invoice.
   */
  getDistance: ({
    from,
    to,
    basis,
  }: {
    from: string;
    to: string;
    basis: DistanceBasis;
  }) =>
    apiRequest<ApiResponse<DistanceResponse>>({
      url: endpoint.distance,
      method: REQUEST_METHOD.GET,
      params: { from, to, basis },
    }),
};
