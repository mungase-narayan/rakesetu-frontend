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
