import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert02Icon,
  FlashIcon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { useRakeStream } from '@/hooks';
import { useRakeEta } from '@/api/eta';
import { useRakeLive, useSectionLoad } from '@/api/rake-event';
import { isEtaAvailable } from '@/types/eta.types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/shared';
import NetworkMap from '@/components/shared/network-map';
import { formatIst } from '@/lib/ist';
import { RAKE_STATE_LABELS } from '@/constants/master-data.constants';
import type { LiveRake } from '@/types/rake-event.types';

import RakeSheet from './components/rake-sheet';

/**
 * The network map — DESIGN.md §11's first vertical slice, closed.
 *
 * *Seed master data → simulator emits events → state machine projects → a rake
 * renders on the map.* Everything on this screen is a fold over `rake_events`;
 * nothing is a hardcoded position.
 *
 * Shared verbatim by the controller and the zonal manager. The zonal persona
 * reads and never writes (§9's matrix), and there is nothing to write here — so
 * rather than a read-only variant with a prop, the two route trees render the
 * same component and the boundary stays where `RoleLayout` puts it.
 */
const NetworkPage = ({
  title = 'Network map',
  description = 'Every rake in the division, projected from its event log — streamed live, with a five-second poll as the floor.',
}: {
  title?: string;
  description?: string;
}) => {
  const [selected, setSelected] = useState<LiveRake | null>(null);

  /**
   * The stream and the poll, together.
   *
   * `useRakeStream` patches the very cache entry `useRakeLive` owns, so the two
   * are not alternatives layered on top of each other — they are one feed with
   * two transports. Polling is switched **off** while the stream is up and back
   * **on** the moment it reports that it has given up, which is what makes
   * "block the SSE request in devtools and the map keeps working" true rather
   * than aspirational.
   */
  const { transport, isLive } = useRakeStream();
  const {
    live,
    rakes,
    terminals,
    counts,
    asOf,
    isLoading,
    isFetching,
    isError,
  } = useRakeLive({ poll: !isLive });

  const { sections, maxTraversals } = useSectionLoad();

  /**
   * The selected rake's remaining path, from the deterministic ETA engine.
   *
   * Fetched here rather than only in the sheet so the answer is drawn on the
   * map — clicking a moving rake should show where it is going, not just tell
   * you in a panel. The sheet reads the same query key, so this is one request.
   */
  const { answer: eta } = useRakeEta(selected?.rakeId ?? '', Boolean(selected));

  const pathSectionIds =
    eta && isEtaAvailable(eta)
      ? eta.eta.path.map((leg) => leg.sectionId)
      : undefined;

  const dirtyCount = rakes?.filter((rake) => rake.isDirty).length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          /*
            The "last updated" label, and it reads the *server's* clock.
            An unlabelled stale map is worse than no map — it is a wrong answer
            wearing the costume of a right one — and a label built from the
            browser's clock would still be wrong about how old the data is.
          */
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {/*
              The transport is on the screen, not hidden in a hook. "Live" and
              "polled every five seconds" are different promises about how old
              the dots are, and a map that silently degraded from one to the
              other while still looking live is the same class of lie as an
              unlabelled stale timestamp.
            */}
            <TransportBadge transport={transport} />

            <span className="flex items-center gap-1.5">
              <HugeiconsIcon
                icon={RefreshIcon}
                size={14}
                strokeWidth={2}
                className={cn(isFetching && 'animate-spin')}
              />
              {asOf ? (
                <span className="tabular-nums">
                  Last updated {formatIst(asOf)}
                </span>
              ) : (
                <span>Waiting for the first update…</span>
              )}
            </span>
          </div>
        }
      />

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            The live feed could not be reached. The map below, if present, is
            the last snapshot that arrived — not the current state.
          </AlertDescription>
        </Alert>
      )}

      {dirtyCount > 0 && (
        <Alert>
          <HugeiconsIcon icon={Alert02Icon} size={16} strokeWidth={2} />
          <AlertDescription>
            {dirtyCount} rake{dirtyCount === 1 ? '' : 's'} received an event out
            of order and {dirtyCount === 1 ? 'is' : 'are'} being re-projected
            from the log. Their positions may be a few seconds stale.
          </AlertDescription>
        </Alert>
      )}

      {counts && Object.keys(counts).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([state, count]) => (
              <Badge key={state} variant="outline" className="font-normal">
                {RAKE_STATE_LABELS[state as keyof typeof RAKE_STATE_LABELS]}
                <span className="ml-1.5 font-semibold tabular-nums">
                  {count}
                </span>
              </Badge>
            ))}
        </div>
      )}

      {isLoading && !live ? (
        <Skeleton className="h-[520px] w-full rounded-xl" />
      ) : (
        <NetworkMap
          rakes={rakes ?? []}
          terminals={terminals ?? []}
          sections={sections}
          maxTraversals={maxTraversals}
          pathSectionIds={pathSectionIds}
          selectedRakeId={selected?.rakeId ?? null}
          onSelectRake={setSelected}
        />
      )}

      <RakeSheet
        rake={
          /*
            Re-read from the live feed rather than held in state, so the sheet
            keeps updating while it is open — a panel frozen at the instant it
            was opened is the same stale-data bug as an unlabelled map.
          */
          selected
            ? (rakes?.find((rake) => rake.rakeId === selected.rakeId) ??
              selected)
            : null
        }
        eta={eta}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
};

/**
 * Which transport is feeding the map.
 *
 * `connecting` is shown rather than swallowed, because the first second after a
 * page load genuinely is neither — and a badge that jumped straight from
 * nothing to "live" would be claiming a connection that had not been made.
 */
const TransportBadge = ({
  transport,
}: {
  transport: 'connecting' | 'stream' | 'polling';
}) => {
  if (transport === 'stream') {
    return (
      <Badge variant="success" className="gap-1">
        <HugeiconsIcon icon={FlashIcon} size={12} strokeWidth={2} />
        Live
      </Badge>
    );
  }

  if (transport === 'connecting') {
    return (
      <Badge variant="secondary" className="gap-1">
        Connecting…
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      Polled every 5 s
    </Badge>
  );
};

export default NetworkPage;
