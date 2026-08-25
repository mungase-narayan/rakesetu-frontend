import type {
  ListChargeRulesQuery,
  ResolveRuleQuery,
} from '@/types/master-data.types';

export const chargeRuleKeys = {
  all: ['charge-rules'] as const,
  lists: () => [...chargeRuleKeys.all, 'list'] as const,
  /**
   * `effectiveAt` is inside the key, and must be: the as-of picker is the whole
   * screen, and caching two different dates under one key would show September's
   * rules for a March question.
   */
  list: (params: ListChargeRulesQuery) =>
    [...chargeRuleKeys.lists(), params] as const,
  resolve: (params: ResolveRuleQuery) =>
    [...chargeRuleKeys.all, 'resolve', params] as const,
};
