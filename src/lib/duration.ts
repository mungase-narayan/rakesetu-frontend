/**
 * Durations, rendered the way an operations screen has to render them.
 *
 * Two rules, and both are about being read at a glance on a phone at a siding:
 * anything over an hour is shown in hours and minutes, because "247 minutes" is
 * a number a person has to do arithmetic on; and hours are never shown as a
 * decimal, because "12.4 h" reads as twelve hours and forty minutes to nobody.
 */

/** `220` → `"3 h 40 m"`. */
export const formatDuration = (minutes: number): string => {
  const whole = Math.max(0, Math.round(minutes));
  const hours = Math.floor(whole / 60);
  const rest = whole % 60;
  if (hours === 0) return `${rest} m`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} m`;
};

/** `12.4` → `"12 h 24 m"`. The API speaks decimal hours; people do not. */
export const formatHours = (hours: number): string =>
  formatDuration(hours * 60);

/**
 * A signed hours figure, for "how far past the free time".
 *
 * The sign is kept and shown, because "2 h 12 m under" and "2 h 12 m over" are
 * opposite operational facts and an absolute value would collapse them.
 */
export const formatHoursDelta = (hours: number): string =>
  `${hours < 0 ? '−' : '+'}${formatHours(Math.abs(hours))}`;
