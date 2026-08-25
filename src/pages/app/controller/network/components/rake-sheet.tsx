import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, Timer02Icon } from '@hugeicons/core-free-icons';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { IstTime } from '@/components/shared';
import { ROUTES } from '@/routes/route-paths';
import { RAKE_STATE_LABELS } from '@/constants/master-data.constants';
import { useRakeCycles, useRakeEvents } from '@/api/rake-event';
import type { LiveRake } from '@/types/rake-event.types';
import type { RakeEtaAnswer } from '@/types/eta.types';

import EventRow from '../../rakes/components/event-row';
import EtaPanel from './eta-panel';

/**
 * Everything the map can say about one rake, without leaving the map.
 *
 * The last ten events, not the whole log — a sheet opened from a marker is a
 * glance, and the full history is one click away at the rake's own screen. Ten
 * is roughly one leg of a turnaround, which is the span that explains "why is
 * it here".
 */
const RakeSheet = ({
  rake,
  eta,
  onOpenChange,
}: {
  rake: LiveRake | null;
  /**
   * Passed in rather than fetched here.
   *
   * The map needs the same answer to draw the remaining path, and a second
   * `useRakeEta` in this component would resolve to the same query key anyway —
   * threading it makes the single fetch obvious instead of incidental.
   */
  eta?: RakeEtaAnswer;
  onOpenChange: (open: boolean) => void;
}) => {
  const rakeId = rake?.rakeId ?? '';
  const { events, isLoading } = useRakeEvents(rakeId, {
    limit: 10,
    includeRejected: true,
  });
  const { cycles } = useRakeCycles(rakeId);

  const openCycle = cycles?.find((cycle) => !cycle.isClosed);

  return (
    <Sheet open={Boolean(rake)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {rake && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {rake.code}
                <Badge variant="secondary">
                  {RAKE_STATE_LABELS[rake.state]}
                </Badge>
              </SheetTitle>
              <SheetDescription>
                {rake.wagonCount} × {rake.wagonTypeCode} · home division{' '}
                {rake.homeDivision}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5 px-4 pb-6">
              {rake.isDirty && (
                /*
                  Shown, not hidden. A dirty projection is one a late event has
                  invalidated and the re-fold has not caught up with — a stale
                  position labelled as stale is honest, and withholding it would
                  leave the marker looking authoritative.
                */
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
                  <HugeiconsIcon
                    icon={Alert02Icon}
                    size={15}
                    strokeWidth={2}
                    className="mt-px shrink-0 text-amber-600"
                  />
                  <p>
                    An event arrived out of order. This position is being
                    re-projected from the log and may be a few seconds stale.
                  </p>
                </div>
              )}

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Field label="Location">
                  {rake.stationName ?? '—'}
                  {rake.stationCode && (
                    <span className="text-muted-foreground">
                      {' '}
                      ({rake.stationCode})
                    </span>
                  )}
                </Field>
                <Field label="Time in state">
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <HugeiconsIcon
                      icon={Timer02Icon}
                      size={14}
                      strokeWidth={2}
                      className="text-muted-foreground"
                    />
                    {rake.hoursInState} h
                  </span>
                </Field>
                <Field label="Since">
                  <IstTime value={rake.since} />
                </Field>
                <Field label="Last event">
                  <IstTime value={rake.lastEventAt} emptyLabel="No events" />
                </Field>
                {rake.previousState && (
                  <Field label="Returns to">
                    {RAKE_STATE_LABELS[rake.previousState]}
                  </Field>
                )}
                <Field label="Current cycle">
                  {openCycle ? (
                    <span className="tabular-nums">
                      {openCycle.eventCount} event
                      {openCycle.eventCount === 1 ? '' : 's'}, opened{' '}
                      <IstTime value={openCycle.startedAt} variant="date" />
                    </span>
                  ) : (
                    <span className="text-muted-foreground">None open</span>
                  )}
                </Field>
              </dl>

              <EtaPanel answer={eta} />

              <section className="space-y-2">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Last ten events
                </h3>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-9 w-full rounded-md" />
                    ))}
                  </div>
                ) : events && events.length > 0 ? (
                  <ol className="space-y-1.5">
                    {events.map((event) => (
                      <EventRow key={event.id} event={event} compact />
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No events recorded against this rake yet.
                  </p>
                )}
              </section>

              <Button asChild variant="outline" className="w-full">
                <Link to={ROUTES.controller.rake(rake.rakeId)}>
                  Open the full event log
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-0.5 font-medium">{children}</dd>
  </div>
);

export default RakeSheet;
