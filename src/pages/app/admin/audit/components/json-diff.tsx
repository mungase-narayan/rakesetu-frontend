import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';

import { asBag, looksLikeId, renderValue, same } from '../diff';

const Value = ({
  value,
  tone,
}: {
  value: unknown;
  tone: 'was' | 'now' | 'flat';
}) => {
  const text = renderValue(value);
  return (
    <span
      className={cn(
        'break-all',
        looksLikeId(text) && 'font-mono text-[12px]',
        tone === 'was' &&
          'text-muted-foreground line-through decoration-muted-foreground/40',
        tone === 'now' && 'font-medium text-emerald-700 dark:text-emerald-400',
        tone === 'flat' && 'text-foreground'
      )}
    >
      {text}
    </span>
  );
};

interface JsonDiffProps {
  before: unknown;
  after: unknown;
}

/**
 * What an audit row actually changed.
 *
 * Deliberately not a fixed before/after table. Each action writes only the
 * fields it touched, and the *shape* of that pair already says what kind of act
 * it was — so the presentation follows it rather than forcing every row into
 * three columns:
 *
 *  - **Created** (no `before`): one column of values. The earlier version
 *    rendered an empty red "Before" cell per field, which reads as "these were
 *    deleted" about a row that had just been born.
 *  - **Removed** (no `after`): one column, struck through.
 *  - **Changed** (both): `was → now`, inline, and only for the keys that
 *    actually moved. Unchanged keys are listed quietly underneath, because
 *    "this field was in scope and did not move" is worth knowing and is not
 *    worth shouting.
 */
const JsonDiff = ({ before, after }: JsonDiffProps) => {
  const beforeBag = asBag(before);
  const afterBag = asBag(after);

  const hasBefore = Object.keys(beforeBag).length > 0;
  const hasAfter = Object.keys(afterBag).length > 0;

  if (!hasBefore && !hasAfter) {
    return (
      <p className="rounded-lg border border-dashed border-border/70 px-3 py-4 text-center text-xs text-muted-foreground">
        No snapshot — this action changed no field worth diffing.
      </p>
    );
  }

  const keys = [
    ...new Set([...Object.keys(beforeBag), ...Object.keys(afterBag)]),
  ];

  /* ---- created / removed: a single column of values ---- */
  if (!hasBefore || !hasAfter) {
    const bag = hasAfter ? afterBag : beforeBag;
    const tone = hasAfter ? 'now' : 'was';

    return (
      <dl className="divide-y divide-border/50 overflow-hidden rounded-lg border border-border/60">
        {Object.keys(bag).map((key) => (
          <div
            key={key}
            className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3 px-3 py-2.5 text-sm"
          >
            <dt className="truncate font-medium text-muted-foreground">
              {key}
            </dt>
            <dd className="min-w-0">
              <Value value={bag[key]} tone={tone} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  /* ---- changed: moved fields first, unchanged listed quietly after ---- */
  const moved = keys.filter((key) => !same(beforeBag[key], afterBag[key]));
  const held = keys.filter((key) => same(beforeBag[key], afterBag[key]));

  return (
    <div className="space-y-3">
      {moved.length > 0 && (
        <dl className="divide-y divide-border/50 overflow-hidden rounded-lg border border-border/60">
          {moved.map((key) => (
            <div
              key={key}
              className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3 px-3 py-2.5 text-sm"
            >
              <dt className="truncate font-medium text-muted-foreground">
                {key}
              </dt>
              <dd className="flex min-w-0 flex-wrap items-center gap-1.5">
                <Value value={beforeBag[key]} tone="was" />
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={13}
                  strokeWidth={2.4}
                  className="shrink-0 text-muted-foreground/60"
                />
                <Value value={afterBag[key]} tone="now" />
              </dd>
            </div>
          ))}
        </dl>
      )}

      {held.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground/70 uppercase">
            Unchanged
          </p>
          <dl className="divide-y divide-border/40 overflow-hidden rounded-lg border border-dashed border-border/50">
            {held.map((key) => (
              <div
                key={key}
                className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3 px-3 py-2 text-xs"
              >
                <dt className="truncate text-muted-foreground">{key}</dt>
                <dd className="min-w-0 text-muted-foreground">
                  <Value value={afterBag[key]} tone="flat" />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};

export default JsonDiff;
