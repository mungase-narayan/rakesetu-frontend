import { useMutation, useQuery } from '@tanstack/react-query';

import { apis } from './apis';
import { etaKeys } from './query-keys';
import type { EstimateBody } from '@/types/eta.types';

/**
 * How long an ETA is worth holding on to.
 *
 * A minute, and the number is a judgement about the data rather than about the
 * network: the estimate only changes when the rake crosses a section, which
 * happens on the order of tens of minutes. Refetching every five seconds
 * alongside the map would be forty requests a minute for a number that moves
 * three times an hour.
 */
const ETA_STALE_MS = 60_000;

/**
 * One rake's ETA.
 *
 * Returns the whole answer, not just the estimate, because "not in transit" is
 * a result the caller has to render — see `isEtaAvailable`. A hook that
 * flattened it to `EtaResult | undefined` would make the reason unreachable and
 * every screen would invent its own empty state.
 */
export const useRakeEta = (rakeId: string, enabled = true) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: etaKeys.rake(rakeId),
    queryFn: () => apis.getRakeEta({ rakeId }),
    select: (res) => res.data.data,
    enabled: Boolean(rakeId) && enabled,
    staleTime: ETA_STALE_MS,
    // A rake with no estimate is a real answer, not a transient failure.
    retry: false,
  });

  return { answer: data, isLoading, isError };
};

/** The ad-hoc estimate. A mutation because it is a POST, not because it writes. */
export const useEstimate = () => {
  const mutation = useMutation({
    mutationFn: (data: EstimateBody) => apis.estimate({ data }),
    retry: false,
  });

  return {
    estimate: mutation.mutateAsync,
    result: mutation.data?.data.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
};

/** The section-weight table behind every estimate. Admin-facing. */
export const useSectionWeights = (wagonTypeCode?: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: etaKeys.sectionWeights(wagonTypeCode),
    queryFn: () => apis.getSectionWeights({ wagonTypeCode }),
    select: (res) => res.data.data,
    staleTime: 5 * 60_000,
  });

  return { table: data, isLoading, isError };
};
