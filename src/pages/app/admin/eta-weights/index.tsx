import { useState } from 'react';

import { useSectionWeights } from '@/api/eta';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader, StatTile } from '@/components/shared';
import { formatDuration } from '@/lib/duration';
import {
  HOUR_BAND_LABELS,
  WEIGHT_SOURCE_LABELS,
  type WeightSource,
} from '@/types/eta.types';

const SOURCE_VARIANT: Record<
  WeightSource,
  'success' | 'warning' | 'secondary'
> = {
  observed: 'success',
  blended: 'warning',
  nominal: 'secondary',
};

/**
 * The inside of the ETA engine, for an administrator asking why an estimate
 * looks wrong.
 *
 * **The interesting column is `source`.** On a fresh database every cell reads
 * `Nominal` — the timetable, because §5.4 derives weights from historical
 * events and a new database has none. After a simulation the mix shifts, and
 * the shape of that shift is the honest answer to "how much does this system
 * actually know": sections that see traffic every day go observed first, night
 * bands go observed last, and a section nobody runs stays on the timetable
 * forever. A table that hid the nominal rows would make the engine look better
 * informed than it is.
 *
 * Guarded by `analytics:read`, which the operating roles do not hold. They see
 * the *answer* and its provenance on the rake sheet; three hundred rows of
 * medians is a debugging tool, not an operating screen.
 */
const EtaWeightsPage = () => {
  const [wagonType, setWagonType] = useState<string | undefined>();
  const { table, isLoading, isError } = useSectionWeights(wagonType);

  const rows = table?.cells ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="ETA section weights"
        description="What the deterministic ETA engine believes each section costs, in each hour band — and whether that belief came from observed running or from the timetable."
      />

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            The weight table could not be read. It is recomputed nightly by
            <code className="mx-1 font-mono text-xs">
              npm run eta:recompute
            </code>
            and cached in Redis for six hours.
          </AlertDescription>
        </Alert>
      )}

      {isLoading && !table ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : table ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={table.wagonTypeCode}
              onValueChange={(value) => setWagonType(value)}
            >
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {table.wagonTypeCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              {table.windowDays}-day window · {table.minObservations} traversals
              needed before a section&rsquo;s own history is used
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile
              label="Observed"
              value={table.summary.observed}
              hint="Enough traversals to use the median"
            />
            <StatTile
              label="Blended"
              value={table.summary.blended}
              hint="Some history, blended toward the timetable"
            />
            <StatTile
              label="Nominal"
              value={table.summary.nominal}
              hint="No traversals yet — the cold-start fallback"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Band</TableHead>
                  <TableHead className="text-right">Minutes</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead className="text-right">Observed median</TableHead>
                  <TableHead className="text-right">Samples</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((cell) => (
                  <TableRow key={`${cell.sectionId}-${cell.band}`}>
                    <TableCell className="font-medium tabular-nums">
                      {cell.fromCode} → {cell.toCode}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {HOUR_BAND_LABELS[cell.band]}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatDuration(cell.minutes)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {formatDuration(cell.nominalMinutes)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {cell.observedMedianMinutes === null
                        ? '—'
                        : formatDuration(cell.observedMedianMinutes)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {cell.samples}
                    </TableCell>
                    <TableCell>
                      <Badge variant={SOURCE_VARIANT[cell.source]}>
                        {WEIGHT_SOURCE_LABELS[cell.source]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default EtaWeightsPage;
