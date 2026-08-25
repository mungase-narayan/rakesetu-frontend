import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apis } from './apis';
import { chargeRuleKeys } from './query-keys';
import type { CreateChargeRuleBody } from './apis';
import type {
  ListChargeRulesQuery,
  ResolveRuleQuery,
} from '@/types/master-data.types';

export const useChargeRuleList = (params: ListChargeRulesQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: chargeRuleKeys.list(params),
    queryFn: () => apis.getChargeRules({ params }),
    select: (res) => res.data.data,
  });

  return {
    rules: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

/**
 * Resolves one rule and reports the losers.
 *
 * `enabled` is gated on `asOf` because the endpoint refuses a request without
 * one — firing it anyway would show a 422 toast every time the panel mounts.
 */
export const useResolveRule = (
  params: ResolveRuleQuery | null,
  enabled = true
) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: chargeRuleKeys.resolve(params as ResolveRuleQuery),
    queryFn: () => apis.resolveRule({ params: params as ResolveRuleQuery }),
    select: (res) => res.data.data,
    enabled: enabled && Boolean(params?.asOf && params?.type),
    retry: false,
  });

  return { resolution: data, isLoading, isError };
};

export const useChargeRuleMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: chargeRuleKeys.all });

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateChargeRuleBody }) =>
      apis.createChargeRule({ data }),
    onSuccess: invalidate,
    retry: false,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateChargeRuleBody>;
    }) => apis.updateChargeRule({ id, data }),
    onSuccess: invalidate,
    retry: false,
  });

  return {
    createChargeRule: create.mutate,
    updateChargeRule: update.mutate,
    isLoading: create.isPending || update.isPending,
  };
};
