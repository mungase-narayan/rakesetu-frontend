import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apis } from './apis';
import { commercialKeys } from './query-keys';
import type {
  AddSidingBody,
  CreateCommodityBody,
  CreateCustomerBody,
} from './apis';
import type {
  ListCommoditiesQuery,
  ListCustomersQuery,
} from '@/types/master-data.types';

export const useCommodityList = (params: ListCommoditiesQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: commercialKeys.commodityList(params),
    queryFn: () => apis.getCommodities({ params }),
    select: (res) => res.data.data,
  });

  return {
    commodities: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

export const useCustomerList = (params: ListCustomersQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: commercialKeys.customerList(params),
    queryFn: () => apis.getCustomers({ params }),
    select: (res) => res.data.data,
  });

  return {
    customers: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

export const useCustomer = (id: string | null) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: commercialKeys.customer(id ?? ''),
    queryFn: () => apis.getCustomer({ id: id as string }),
    select: (res) => res.data.data,
    enabled: Boolean(id),
  });

  return { customer: data, isLoading, isError };
};

export const useCommodityMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: commercialKeys.commodities() });

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateCommodityBody }) =>
      apis.createCommodity({ data }),
    onSuccess: invalidate,
    retry: false,
  });

  const update = useMutation({
    mutationFn: ({
      code,
      data,
    }: {
      code: string;
      data: Partial<CreateCommodityBody>;
    }) => apis.updateCommodity({ code, data }),
    onSuccess: invalidate,
    retry: false,
  });

  return {
    createCommodity: create.mutate,
    updateCommodity: update.mutate,
    isLoading: create.isPending || update.isPending,
  };
};

export const useCustomerMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: commercialKeys.customers() });

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateCustomerBody }) =>
      apis.createCustomer({ data }),
    onSuccess: invalidate,
    retry: false,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCustomerBody>;
    }) => apis.updateCustomer({ id, data }),
    onSuccess: invalidate,
    retry: false,
  });

  const addSiding = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddSidingBody }) =>
      apis.addSiding({ id, data }),
    onSuccess: invalidate,
    retry: false,
  });

  const removeSiding = useMutation({
    mutationFn: ({ id, sidingId }: { id: string; sidingId: string }) =>
      apis.removeSiding({ id, sidingId }),
    onSuccess: invalidate,
    retry: false,
  });

  return {
    createCustomer: create.mutate,
    updateCustomer: update.mutate,
    addSiding: addSiding.mutate,
    removeSiding: removeSiding.mutate,
    isLoading:
      create.isPending ||
      update.isPending ||
      addSiding.isPending ||
      removeSiding.isPending,
  };
};
