import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apis } from './apis';
import { assetKeys } from './query-keys';
import type {
  CreateRakeBody,
  CreateWagonBody,
  CreateWagonTypeBody,
  UpdateRakeBody,
} from './apis';
import type {
  ListRakesQuery,
  ListWagonTypesQuery,
  ListWagonsQuery,
} from '@/types/master-data.types';

export const useWagonTypeList = (params: ListWagonTypesQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: assetKeys.wagonTypeList(params),
    queryFn: () => apis.getWagonTypes({ params }),
    select: (res) => res.data.data,
  });

  return {
    wagonTypes: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

export const useWagonList = (params: ListWagonsQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: assetKeys.wagonList(params),
    queryFn: () => apis.getWagons({ params }),
    select: (res) => res.data.data,
  });

  return {
    wagons: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

export const useRakeList = (params: ListRakesQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: assetKeys.rakeList(params),
    queryFn: () => apis.getRakes({ params }),
    select: (res) => res.data.data,
  });

  return {
    rakes: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

/** The composition valid at `at` — plus the constraints derived from it. */
export const useRakeComposition = (id: string | null, at?: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: assetKeys.composition(id ?? '', at),
    queryFn: () => apis.getComposition({ id: id as string, at }),
    select: (res) => res.data.data,
    enabled: Boolean(id),
  });

  return {
    composition: data?.composition,
    constraints: data?.constraints,
    at: data?.at,
    isLoading,
    isError,
  };
};

export const useWagonTypeMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: assetKeys.wagonTypes() });

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateWagonTypeBody }) =>
      apis.createWagonType({ data }),
    onSuccess: invalidate,
    retry: false,
  });

  const update = useMutation({
    mutationFn: ({
      code,
      data,
    }: {
      code: string;
      data: Partial<CreateWagonTypeBody>;
    }) => apis.updateWagonType({ code, data }),
    onSuccess: invalidate,
    retry: false,
  });

  return {
    createWagonType: create.mutate,
    updateWagonType: update.mutate,
    isLoading: create.isPending || update.isPending,
  };
};

export const useWagonMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: assetKeys.wagons() });

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateWagonBody }) =>
      apis.createWagon({ data }),
    onSuccess: invalidate,
    retry: false,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateWagonBody>;
    }) => apis.updateWagon({ id, data }),
    onSuccess: invalidate,
    retry: false,
  });

  return {
    createWagon: create.mutate,
    updateWagon: update.mutate,
    isLoading: create.isPending || update.isPending,
  };
};

export const useRakeMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: assetKeys.rakes() });

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateRakeBody }) =>
      apis.createRake({ data }),
    onSuccess: invalidate,
    retry: false,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRakeBody }) =>
      apis.updateRake({ id, data }),
    onSuccess: invalidate,
    retry: false,
  });

  return {
    createRake: create.mutate,
    updateRake: update.mutate,
    isLoading: create.isPending || update.isPending,
  };
};
