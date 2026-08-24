import { describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

import { usePermission } from '@/hooks';
import { makeStore } from '@/test/render';
import type { AuthStateOverrides } from '@/test/render';

const withAuth = (auth: AuthStateOverrides) => {
  const store = makeStore(auth);
  return renderHook(() => usePermission(), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('usePermission', () => {
  it('answers can() from the permissions the server returned', () => {
    const { result } = withAuth({
      roles: ['commercial_officer'],
      permissions: ['charge:read', 'charge:waive', 'invoice:issue'],
    });

    expect(result.current.can('charge:waive')).toBe(true);
    expect(result.current.can('indent:approve')).toBe(false);
  });

  it('canAny is an OR over alternatives', () => {
    const { result } = withAuth({
      roles: ['terminal_supervisor'],
      permissions: ['terminal:log', 'rake:read'],
    });

    expect(result.current.canAny('charge:waive', 'terminal:log')).toBe(true);
    expect(result.current.canAny('charge:waive', 'invoice:issue')).toBe(false);
  });

  it('canAll matches the backend AND semantics', () => {
    const { result } = withAuth({
      roles: ['freight_controller'],
      permissions: ['rake:allot', 'rake:override', 'indent:approve'],
    });

    expect(result.current.canAll('rake:allot', 'rake:override')).toBe(true);
    // One of the two is missing, so the pair is not held — which is what
    // `requirePermission(a, b)` will decide on the server too.
    expect(result.current.canAll('rake:allot', 'charge:waive')).toBe(false);
  });

  it('denies everything when the list is empty', () => {
    const { result } = withAuth({ roles: [], permissions: [] });

    expect(result.current.can('rake:read')).toBe(false);
    expect(result.current.canAny('rake:read', 'charge:read')).toBe(false);
    // Vacuous truth is the correct answer for canAll over nothing, and is why
    // no caller ever invokes it with an empty list.
    expect(result.current.canAll()).toBe(true);
  });
});
