import { apiRequest } from '@/request';
import { REQUEST_METHOD } from '@/constants';
import type { ApiResponse } from '@/types/shared.types';
import type { Paginated } from '@/types/pagination.types';
import type {
  ChargeRule,
  ChargeRuleParams,
  ChargeRuleType,
  ListChargeRulesQuery,
  ResolveRuleQuery,
  RuleResolution,
  RuleSelector,
} from '@/types/master-data.types';

const endpoint = {
  chargeRules: '/charge-rules',
  chargeRule: (id: string) => `/charge-rules/${id}`,
  resolve: '/charge-rules/resolve',
};

export interface CreateChargeRuleBody {
  type: ChargeRuleType;
  params: ChargeRuleParams;
  selector: RuleSelector;
  effectiveFrom: string;
  effectiveTo?: string | null;
  circularRef: string;
  clauseRef?: string | null;
  documentId?: string | null;
  version?: number;
  supersedesId?: string | null;
}

export const apis = {
  getChargeRules: ({ params }: { params: ListChargeRulesQuery }) =>
    apiRequest<ApiResponse<Paginated<ChargeRule>>>({
      url: endpoint.chargeRules,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  createChargeRule: ({ data }: { data: CreateChargeRuleBody }) =>
    apiRequest<ApiResponse<ChargeRule>>({
      url: endpoint.chargeRules,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  updateChargeRule: ({
    id,
    data,
  }: {
    id: string;
    data: Partial<CreateChargeRuleBody>;
  }) =>
    apiRequest<ApiResponse<ChargeRule>>({
      url: endpoint.chargeRule(id),
      method: REQUEST_METHOD.PATCH,
      data: data as unknown as Record<string, unknown>,
    }),

  /**
   * The rule tester.
   *
   * `asOf` is required and there is no "current" shorthand — the same decision
   * the service makes, for the same reason: "today" is the wrong answer to
   * every question asked about a past shipment. The response carries the winner
   * *and* every rule that lost, with a reason.
   */
  resolveRule: ({ params }: { params: ResolveRuleQuery }) =>
    apiRequest<ApiResponse<RuleResolution>>({
      url: endpoint.resolve,
      method: REQUEST_METHOD.GET,
      params: {
        type: params.type,
        asOf: params.asOf,
        // The query names one value per dimension; the API's parameter names
        // are the plural stored ones, which is what keeps them recognisable
        // next to a rule's selector on screen.
        commodityGroups: params.commodityGroup,
        terminalTypes: params.terminalType,
        handlingModes: params.handlingMode,
        wagonTypeCodes: params.wagonTypeCode,
        divisions: params.division,
      },
    }),
};
