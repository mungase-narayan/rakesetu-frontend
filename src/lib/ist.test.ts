import { describe, expect, it } from 'vitest';

import { formatIst } from '@/lib/ist';

/**
 * The §7 convention, asserted: stored UTC, displayed IST, labelled.
 *
 * The machine's own zone is never consulted, so this passes on a laptop set to
 * Europe/London as readily as one set to Asia/Kolkata — which is the property
 * that matters, because a demurrage clock four hours out is a billing dispute.
 */
describe('formatIst', () => {
  it('renders a UTC instant as a labelled IST date-time', () => {
    expect(formatIst('2026-08-23T17:26:00Z')).toBe('23 Aug 2026, 10:56 PM IST');
  });

  it('crosses the date line the +05:30 offset implies', () => {
    // 23:00 UTC is already the next morning in India.
    expect(formatIst('2026-08-23T23:00:00Z')).toBe('24 Aug 2026, 4:30 AM IST');
  });

  it('renders a date-only variant without the time or the label', () => {
    expect(formatIst('2026-08-23T17:26:00Z', 'date')).toBe('23 Aug 2026');
  });

  it('returns an em dash for absent or unparseable input', () => {
    expect(formatIst(null)).toBe('—');
    expect(formatIst(undefined)).toBe('—');
    expect(formatIst('not a date')).toBe('—');
  });
});
