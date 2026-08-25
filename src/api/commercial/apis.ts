import { apiRequest } from '@/request';
import { REQUEST_METHOD } from '@/constants';
import type { ApiResponse } from '@/types/shared.types';
import type { Paginated } from '@/types/pagination.types';
import type {
  Commodity,
  Customer,
  CustomerDetail,
  CustomerSiding,
  ListCommoditiesQuery,
  ListCustomersQuery,
} from '@/types/master-data.types';

const endpoint = {
  commodities: '/commodities',
  commodity: (code: string) => `/commodities/${code}`,
  customers: '/customers',
  customer: (id: string) => `/customers/${id}`,
  sidings: (id: string) => `/customers/${id}/sidings`,
  siding: (id: string, sidingId: string) =>
    `/customers/${id}/sidings/${sidingId}`,
};

export type CreateCommodityBody = Omit<
  Commodity,
  'createdAt' | 'updatedAt' | 'isHazardous'
> & { isHazardous?: boolean };

export type CreateCustomerBody = Omit<
  Customer,
  'id' | 'orgId' | 'createdAt' | 'updatedAt' | 'isActive' | 'customerOrgId'
> & { isActive?: boolean; customerOrgId?: string | null };

export interface AddSidingBody {
  terminalId: string;
  commodityCodes: string[];
  isDefaultLoading?: boolean;
  isDefaultDest?: boolean;
}

export const apis = {
  getCommodities: ({ params }: { params: ListCommoditiesQuery }) =>
    apiRequest<ApiResponse<Paginated<Commodity>>>({
      url: endpoint.commodities,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  createCommodity: ({ data }: { data: CreateCommodityBody }) =>
    apiRequest<ApiResponse<Commodity>>({
      url: endpoint.commodities,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  updateCommodity: ({
    code,
    data,
  }: {
    code: string;
    data: Partial<CreateCommodityBody>;
  }) =>
    apiRequest<ApiResponse<Commodity>>({
      url: endpoint.commodity(code),
      method: REQUEST_METHOD.PATCH,
      data: data as unknown as Record<string, unknown>,
    }),

  getCustomers: ({ params }: { params: ListCustomersQuery }) =>
    apiRequest<ApiResponse<Paginated<Customer>>>({
      url: endpoint.customers,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  /** The row plus its sidings — what the detail sheet renders. */
  getCustomer: ({ id }: { id: string }) =>
    apiRequest<ApiResponse<CustomerDetail>>({
      url: endpoint.customer(id),
      method: REQUEST_METHOD.GET,
    }),

  createCustomer: ({ data }: { data: CreateCustomerBody }) =>
    apiRequest<ApiResponse<Customer>>({
      url: endpoint.customers,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  updateCustomer: ({
    id,
    data,
  }: {
    id: string;
    data: Partial<CreateCustomerBody>;
  }) =>
    apiRequest<ApiResponse<Customer>>({
      url: endpoint.customer(id),
      method: REQUEST_METHOD.PATCH,
      data: data as unknown as Record<string, unknown>,
    }),

  addSiding: ({ id, data }: { id: string; data: AddSidingBody }) =>
    apiRequest<ApiResponse<CustomerSiding>>({
      url: endpoint.sidings(id),
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  removeSiding: ({ id, sidingId }: { id: string; sidingId: string }) =>
    apiRequest<ApiResponse<{ id: string }>>({
      url: endpoint.siding(id, sidingId),
      method: REQUEST_METHOD.DELETE,
    }),
};
