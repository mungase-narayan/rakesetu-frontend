import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apis } from './apis';
import { networkKeys } from './query-keys';
import type {
  CreateChargeableDistanceBody,
  CreateSectionBody,
  CreateStationBody,
} from './apis';
import type {
  DistanceBasis,
  ListChargeableDistancesQuery,
  ListSectionsQuery,
  ListStationsQuery,
} from '@/types/master-data.types';

export const useStationList = (params: ListStationsQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: networkKeys.stationList(params),
    queryFn: () => apis.getStations({ params }),
    select: (res) => res.data.data,
  });

  return {
    stations: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

export const useSectionList = (params: ListSectionsQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: networkKeys.sectionList(params),
    queryFn: () => apis.getSections({ params }),
    select: (res) => res.data.data,
  });

  return {
    sections: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

export const useChargeableDistanceList = (
  params: ListChargeableDistancesQuery = {}
) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: networkKeys.distanceList(params),
    queryFn: () => apis.getChargeableDistances({ params }),
    select: (res) => res.data.data,
  });

  return {
    distances: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

/**
 * One distance, on one basis.
 *
 * `retry: false` because the interesting failure is a **422** — "no chargeable
 * distance on record" — and retrying a deterministic refusal three times only
 * delays showing it.
 */
export const useDistance = (
  from: string,
  to: string,
  basis: DistanceBasis,
  enabled = true
) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: networkKeys.distance(from, to, basis),
    queryFn: () => apis.getDistance({ from, to, basis }),
    select: (res) => res.data.data,
    enabled: enabled && Boolean(from && to),
    retry: false,
  });

  return { distance: data, isLoading, isError, error };
};

export const useStationMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: networkKeys.stations() });

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateStationBody }) =>
      apis.createStation({ data }),
    onSuccess: invalidate,
    retry: false,
  });

  const update = useMutation({
    mutationFn: ({
      code,
      data,
    }: {
      code: string;
      data: Partial<CreateStationBody>;
    }) => apis.updateStation({ code, data }),
    onSuccess: invalidate,
    retry: false,
  });

  return {
    createStation: create.mutate,
    updateStation: update.mutate,
    isLoading: create.isPending || update.isPending,
  };
};

export const useSectionMutations = () => {
  const queryClient = useQueryClient();
  // Sections feed the cached network graph, and a distance answer computed from
  // a stale graph is the kind of wrong nobody notices. Both key spaces go.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: networkKeys.sections() });
    queryClient.invalidateQueries({ queryKey: networkKeys.all });
  };

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateSectionBody | CreateSectionBody[] }) =>
      apis.createSections({ data }),
    onSuccess: invalidate,
    retry: false,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateSectionBody>;
    }) => apis.updateSection({ id, data }),
    onSuccess: invalidate,
    retry: false,
  });

  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => apis.deleteSection({ id }),
    onSuccess: invalidate,
    retry: false,
  });

  return {
    createSections: create.mutate,
    updateSection: update.mutate,
    deleteSection: remove.mutate,
    isLoading: create.isPending || update.isPending || remove.isPending,
  };
};

export const useChargeableDistanceMutations = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: ({
      data,
    }: {
      data: CreateChargeableDistanceBody | CreateChargeableDistanceBody[];
    }) => apis.createChargeableDistances({ data }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: networkKeys.distances() }),
    retry: false,
  });

  return {
    createChargeableDistances: create.mutate,
    isLoading: create.isPending,
  };
};
