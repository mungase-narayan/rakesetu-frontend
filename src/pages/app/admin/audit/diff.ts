/**
 * The pure half of the audit diff — no JSX, so screens can ask "how many fields
 * did this touch?" without importing a component.
 */
import { formatIst } from '@/lib/ist';

export type Bag = Record<string, unknown>;

/** An ISO-8601 instant, which is how every timestamp reaches the client. */
const ISO_INSTANT =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

export const asBag = (value: unknown): Bag =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Bag)
    : {};

export const same = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

export const renderValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') {
    if (value === '') return '(empty)';
    // §7's convention holds inside the diff too. A snapshot of `lastLoginAt`
    // arrives as a UTC ISO string, and leaving it raw would make this the one
    // place in the product that shows a person an unlabelled UTC timestamp.
    if (ISO_INSTANT.test(value)) return formatIst(value);
    return value;
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

/** Long opaque ids get monospace; prose does not. */
export const looksLikeId = (text: string): boolean => {
  // A formatted timestamp is long but is prose, not an identifier.
  if (text.endsWith(' IST')) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(text) || text.length > 28;
};

/**
 * How many fields an entry touched.
 *
 * For a create or a delete every key counts — the whole snapshot is the change.
 * For an update only the keys that actually moved do, which is what makes the
 * count in the sheet's heading mean something.
 */
export const changedFieldCount = (before: unknown, after: unknown): number => {
  const b = asBag(before);
  const a = asBag(after);
  const keys = [...new Set([...Object.keys(b), ...Object.keys(a)])];

  if (Object.keys(b).length === 0 || Object.keys(a).length === 0) {
    return keys.length;
  }
  return keys.filter((key) => !same(b[key], a[key])).length;
};
