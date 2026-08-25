import { HugeiconsIcon } from '@hugeicons/react';
import { Route01Icon } from '@hugeicons/core-free-icons';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IstTime } from '@/components/shared';
import { formatDuration } from '@/lib/duration';
import {
  CONFIDENCE_LABELS,
  ETA_REASON_LABELS,
  HOUR_BAND_LABELS,
  WEIGHT_SOURCE_LABELS,
  isEtaAvailable,
  type EtaConfidence,
  type RakeEtaAnswer,
  type WeightSource,
} from '@/types/eta.types';

/**
 * The ETA, and where every minute of it came from.
 *
 * **The per-section breakdown is the point.** An arrival time on its own is a
 * number to be argued with; "281 km over six sections, four of them from
 * observed running and two from the timetable" is a number that can be
 * checked — and it is what makes the estimate defensible rather than merely
 * displayed.
 *
 * There is no band, no ± and no percentage likelihood, and that is a refusal
 * rather than an omission: Tier 2's p50/p80/p90 needs the residual model Phase
 * 8 builds from completed cycles, and a confidence interval printed here would
 * be a statistic the system cannot compute. What is shown instead is coverage —
 * how much of the estimate rests on measurement.
 */
const SOURCE_VARIANT: Record<
  WeightSource,
  'success' | 'warning' | 'secondary'
> = {
  observed: 'success',
  blended: 'warning',
  nominal: 'secondary',
};

const CONFIDENCE_VARIANT: Record<
  EtaConfidence,
  'success' | 'warning' | 'secondary'
> = {
  high: 'success',
  medium: 'warning',
  low: 'secondary',
};

const EtaPanel = ({
  answer,
  isLoading,
}: {
  answer: RakeEtaAnswer | undefined;
  isLoading?: boolean;
}) => (
  <section className="space-y-2">
    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      Estimated arrival
    </h3>

    {isLoading && !answer ? (
      <Skeleton className="h-24 w-full rounded-lg" />
    ) : !answer ? null : !isEtaAvailable(answer) ? (
      /*
        No time, and the reason in the server's own words. The alternative — an
        empty space, or worse a plausible-looking figure — is what makes a
        customer plan a truck around an estimate the system never made.
      */
      <div className="rounded-lg border border-dashed border-border/70 p-3">
        <p className="text-sm font-medium">
          {ETA_REASON_LABELS[answer.reason]}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{answer.detail}</p>
      </div>
    ) : (
      <div className="space-y-3 rounded-lg border border-border/60 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm">
              Arrives{' '}
              <span className="font-semibold">
                {answer.destinationName ?? answer.destinationStationCode}
              </span>{' '}
              about{' '}
              <span className="font-semibold">
                <IstTime value={answer.eta.arrivalAt} />
              </span>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
              <HugeiconsIcon icon={Route01Icon} size={13} strokeWidth={2} />
              {answer.eta.totalKm} km via {answer.eta.path.length} section
              {answer.eta.path.length === 1 ? '' : 's'} ·{' '}
              {formatDuration(answer.eta.totalMinutes)}
            </p>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant={CONFIDENCE_VARIANT[answer.eta.confidence]}>
                {CONFIDENCE_LABELS[answer.eta.confidence].short}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {CONFIDENCE_LABELS[answer.eta.confidence].detail}{' '}
              {Math.round(answer.eta.observedShare * 100)}% of the minutes below
              come from observed traversals. This is a coverage figure, not a
              probability — confidence bands arrive with the statistical tier.
            </TooltipContent>
          </Tooltip>
        </div>

        {answer.isOverdue && (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-2 text-xs">
            This arrival is already in the past. Either the rake is running late
            or nothing has been recorded since it last passed a section.
          </p>
        )}

        <ol className="space-y-1">
          {answer.eta.path.map((leg) => (
            <li
              key={leg.sectionId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/50 px-2.5 py-1.5 text-xs"
            >
              <span className="font-medium tabular-nums">
                {leg.fromCode} → {leg.toCode}
              </span>

              <span className="flex items-center gap-2 text-muted-foreground tabular-nums">
                <span>{leg.distanceKm} km</span>
                <span>{formatDuration(leg.minutes)}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant={SOURCE_VARIANT[leg.source]}>
                      {WEIGHT_SOURCE_LABELS[leg.source]}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {leg.source === 'observed' &&
                      `The median of ${leg.samples} observed traversals of this section, entering it in the ${HOUR_BAND_LABELS[leg.band].toLowerCase()} band.`}
                    {leg.source === 'blended' &&
                      `Only ${leg.samples} traversal${leg.samples === 1 ? '' : 's'} observed so far, so this is blended toward the nominal speed.`}
                    {leg.source === 'nominal' &&
                      'No traversals observed yet — this leg is the section’s nominal speed.'}
                  </TooltipContent>
                </Tooltip>
              </span>
            </li>
          ))}
        </ol>
      </div>
    )}
  </section>
);

export default EtaPanel;
