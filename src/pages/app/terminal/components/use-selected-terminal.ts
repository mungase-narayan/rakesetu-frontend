import { useMemo, useState } from 'react';

import { useBoardOptions } from '@/api/terminal';

const STORAGE_KEY = 'rakesetu:terminal:selected';

const readRemembered = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage disabled, or a private window. The default below still works.
    return null;
  }
};

/**
 * The terminal the three supervisor screens are all pointed at.
 *
 * Remembered in `localStorage`, because a supervisor works one terminal for a
 * whole shift and re-choosing it on every navigation between the board, the log
 * and the exception screen would be the first thing anybody complained about.
 *
 * **The choice is derived, not stored in an effect.** The resolution order —
 * what was clicked, then what was remembered, then the first terminal — is a
 * pure function of the options and the click, so it is computed during render.
 * Writing it into state from an effect would render once with `null`, mount the
 * board against no terminal, and correct itself a frame later.
 *
 * Every candidate is **validated against the options the server returned**.
 * Without that, a supervisor whose posting changed — or whose saved id belongs
 * to a terminal since deactivated — would open the board to a 404 they could
 * not clear without knowing about browser storage.
 */
export const useSelectedTerminal = () => {
  const { options, isLoading } = useBoardOptions();
  const [chosen, setChosen] = useState<string | null>(null);
  const [remembered] = useState(readRemembered);

  const terminalId = useMemo(() => {
    if (!options || options.length === 0) return null;

    const exists = (id: string | null) =>
      Boolean(id) && options.some((option) => option.id === id);

    if (exists(chosen)) return chosen;
    if (exists(remembered)) return remembered;
    return options[0].id;
  }, [options, chosen, remembered]);

  const choose = (id: string) => {
    setChosen(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Non-fatal: the choice simply does not survive a reload.
    }
  };

  return {
    options,
    terminalId,
    terminal: options?.find((option) => option.id === terminalId) ?? null,
    choose,
    isLoading,
  };
};

export default useSelectedTerminal;
