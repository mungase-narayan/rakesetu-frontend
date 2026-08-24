import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'rakesetu.sidebar.collapsed';

/**
 * The desktop sidebar's collapsed/expanded state, remembered across reloads.
 *
 * `localStorage` rather than redux-persist: this is a per-device display
 * preference with no business meaning, and putting it in the auth-shaped store
 * would mean a signed-out user loses their layout. Reads are wrapped because a
 * private window and a browser configured to block site data both throw on
 * access rather than returning null.
 */
const readStored = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const useSidebarState = () => {
  const [collapsed, setCollapsed] = useState<boolean>(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // A preference that cannot be saved is still a preference for this tab.
    }
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsed((value) => !value), []);

  return { collapsed, setCollapsed, toggle };
};

export default useSidebarState;
