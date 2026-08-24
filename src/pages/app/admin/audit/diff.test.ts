import { describe, expect, it } from 'vitest';

import { changedFieldCount, looksLikeId, renderValue } from './diff';

describe('audit diff helpers', () => {
  describe('renderValue', () => {
    it('renders an ISO instant as a labelled IST timestamp', () => {
      // The §7 convention has to hold inside the diff too: `lastLoginAt`
      // arrives as UTC, and this is the one place it could reach a person raw.
      expect(renderValue('2026-08-23T17:26:00.000Z')).toBe(
        '23 Aug 2026, 10:56 PM IST'
      );
    });

    it('leaves ordinary strings alone', () => {
      expect(renderValue('terminal_supervisor')).toBe('terminal_supervisor');
      expect(renderValue('2026-08-23')).toBe('2026-08-23');
    });

    it('distinguishes absent from empty', () => {
      expect(renderValue(null)).toBe('—');
      expect(renderValue(undefined)).toBe('—');
      expect(renderValue('')).toBe('(empty)');
    });

    it('renders booleans and objects readably', () => {
      expect(renderValue(false)).toBe('false');
      expect(renderValue({ a: 1 })).toBe('{"a":1}');
    });
  });

  describe('looksLikeId', () => {
    it('treats a UUID as an identifier and a timestamp as prose', () => {
      expect(looksLikeId('3b59ebdb-5481-4fde-80dc-7be6dbc72815')).toBe(true);
      expect(looksLikeId('23 Aug 2026, 10:56 PM IST')).toBe(false);
      expect(looksLikeId('active')).toBe(false);
    });
  });

  describe('changedFieldCount', () => {
    it('counts every key of a creation — the whole snapshot is the change', () => {
      expect(changedFieldCount(null, { role: 'admin', status: 'active' })).toBe(
        2
      );
    });

    it('counts every key of a removal', () => {
      expect(changedFieldCount({ role: 'admin' }, null)).toBe(1);
    });

    it('counts only the keys that moved on an update', () => {
      const before = {
        firstName: 'Drawer',
        lastName: 'Demo',
        status: 'inactive',
      };
      const after = {
        firstName: 'Renamed',
        lastName: 'Demo',
        status: 'inactive',
      };
      expect(changedFieldCount(before, after)).toBe(1);
    });

    it('is zero when an action recorded no snapshot', () => {
      expect(changedFieldCount(null, null)).toBe(0);
    });
  });
});
