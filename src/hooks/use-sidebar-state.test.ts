import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import useSidebarState from '@/hooks/use-sidebar-state';

const KEY = 'rakesetu.sidebar.collapsed';

describe('useSidebarState', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts expanded', () => {
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.collapsed).toBe(false);
  });

  it('persists the collapsed state', () => {
    const { result } = renderHook(() => useSidebarState());

    act(() => result.current.toggle());

    expect(result.current.collapsed).toBe(true);
    expect(window.localStorage.getItem(KEY)).toBe('true');
  });

  it('reads the stored state back on a fresh mount — the reload case', () => {
    window.localStorage.setItem(KEY, 'true');

    const { result } = renderHook(() => useSidebarState());
    expect(result.current.collapsed).toBe(true);
  });
});
