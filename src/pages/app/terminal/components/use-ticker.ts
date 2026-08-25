import { useEffect, useState } from 'react';

/**
 * Re-renders on an interval, so a duration computed from a fixed timestamp
 * appears to tick.
 *
 * **Why the clock and not the server.** "Six hours on hand" has to advance
 * while a supervisor watches, and the alternative — polling the board every
 * second so the server can recompute it — would be sixty requests a minute to
 * move a number the browser can derive from `placedAt` on its own. The board
 * still refetches on its own schedule; this only keeps the *display* honest
 * between refetches.
 *
 * Thirty seconds by default, because the smallest unit shown is a minute and a
 * one-second tick would be twenty-nine wasted renders out of thirty.
 */
export const useTicker = (intervalMs = 30_000): number => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
};

export default useTicker;
