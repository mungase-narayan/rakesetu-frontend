import { apiRequest } from '@/request';
import { REQUEST_METHOD } from '@/constants';
import type { ApiResponse } from '@/types/shared.types';
import type {
  EstimateBody,
  EtaResult,
  RakeEtaAnswer,
  SectionWeightTable,
} from '@/types/eta.types';

const endpoint = {
  rake: (rakeId: string) => `/eta/rake/${rakeId}`,
  estimate: '/eta/estimate',
  sectionWeights: '/eta/section-weights',
};

export const apis = {
  /**
   * Where this rake gets to, and when.
   *
   * **Answers 200 with `eta: null` and a reason** for a rake that is not
   * moving — that is a successful answer to a legitimate question, not an
   * error, so nothing here should treat it as one.
   */
  getRakeEta: ({ rakeId }: { rakeId: string }) =>
    apiRequest<ApiResponse<RakeEtaAnswer>>({
      url: endpoint.rake(rakeId),
      method: REQUEST_METHOD.GET,
    }),

  /** An ad-hoc pair. 422 when the network has no route between them. */
  estimate: ({ data }: { data: EstimateBody }) =>
    apiRequest<ApiResponse<EtaResult>>({
      url: endpoint.estimate,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  /** The inside of the engine. `analytics:read` — admin and above. */
  getSectionWeights: ({ wagonTypeCode }: { wagonTypeCode?: string } = {}) =>
    apiRequest<ApiResponse<SectionWeightTable>>({
      url: endpoint.sectionWeights,
      method: REQUEST_METHOD.GET,
      params: wagonTypeCode ? { wagonTypeCode } : undefined,
    }),
};
