/**
 * Renders a UTC instant in India Standard Time, **labelled**.
 *
 * DESIGN.md §7's convention, in one component so no screen improvises: every
 * timestamp the product stores is UTC, every timestamp a person reads is IST,
 * and the "IST" suffix is what makes the second sentence checkable. A demurrage
 * clock that is four hours off is a billing dispute, and the way that bug
 * arrives is a screen that formatted a date with the browser's local zone
 * because it happened to be right on the developer's laptop.
 *
 * `Asia/Kolkata` is passed explicitly for that reason — the machine's zone is
 * never consulted.
 */
const IST_ZONE = 'Asia/Kolkata';

const DATE_TIME: Intl.DateTimeFormatOptions = {
  timeZone: IST_ZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};

const DATE_ONLY: Intl.DateTimeFormatOptions = {
  timeZone: IST_ZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

/** `formatIst("2026-08-23T17:26:00Z")` → `"23 Aug 2026, 10:56 PM IST"`. */
export const formatIst = (
  value: string | Date | null | undefined,
  variant: 'datetime' | 'date' = 'datetime'
): string => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const formatted = new Intl.DateTimeFormat(
    'en-IN',
    variant === 'date' ? DATE_ONLY : DATE_TIME
  ).format(date);

  // en-IN emits a narrow no-break space before am/pm and lowercases it.
  const normalized = formatted
    // U+202F narrow no-break space, which en-IN puts before am/pm.
    .replace(/\u202f/g, ' ')
    .replace(/\bam\b/i, 'AM')
    .replace(/\bpm\b/i, 'PM');

  return variant === 'date' ? normalized : `${normalized} IST`;
};

const IST_OFFSET_MINUTES = 330;

/**
 * A UTC instant as the `YYYY-MM-DDTHH:mm` an `<input type="datetime-local">`
 * wants — **in IST**, whatever zone the device is in.
 *
 * The browser's native control has no time zone: it shows and returns a wall
 * clock, and which wall clock that is depends entirely on the machine. A tablet
 * at a siding is almost certainly on IST, and a laptop in a different zone is
 * the case that produces a placement stamped five and a half hours out — which
 * is not a display bug, it is a demurrage clock that started at the wrong time.
 * So the conversion is explicit in both directions and the field is labelled.
 */
export const toIstInputValue = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  return new Date(date.getTime() + IST_OFFSET_MINUTES * 60_000)
    .toISOString()
    .slice(0, 16);
};

/** The inverse: a wall clock the supervisor typed, read as IST, back to UTC. */
export const fromIstInputValue = (value: string): Date =>
  new Date(
    new Date(`${value}:00.000Z`).getTime() - IST_OFFSET_MINUTES * 60_000
  );
