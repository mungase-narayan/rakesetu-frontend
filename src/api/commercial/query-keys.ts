import type {
  ListCommoditiesQuery,
  ListCustomersQuery,
} from '@/types/master-data.types';

export const commercialKeys = {
  all: ['commercial'] as const,

  commodities: () => [...commercialKeys.all, 'commodities'] as const,
  commodityList: (params: ListCommoditiesQuery) =>
    [...commercialKeys.commodities(), params] as const,

  customers: () => [...commercialKeys.all, 'customers'] as const,
  customerList: (params: ListCustomersQuery) =>
    [...commercialKeys.customers(), params] as const,
  customer: (id: string) => [...commercialKeys.customers(), id] as const,
};
