import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { ROUTES } from '@/routes/route-paths';
import type { LoginRole, UserRoleType } from '@/types/user.types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Landing path for each role after login — one workspace per persona.
 *
 * Later phases add screens *inside* an owning tree and never a seventh
 * top-level branch, so this map is expected to stay six entries long for the
 * rest of the build.
 */
export const ROLE_HOME: Record<UserRoleType, string> = {
  admin: ROUTES.admin.dashboard,
  zonal_manager: ROUTES.zonal.dashboard,
  freight_controller: ROUTES.controller.dashboard,
  terminal_supervisor: ROUTES.terminal.dashboard,
  commercial_officer: ROUTES.commercial.dashboard,
  freight_customer: ROUTES.customer.dashboard,
};

/**
 * Where an authenticated user belongs.
 *
 * `activeRole` wins over `roles[0]` when it is set and still held. A user with
 * two grants has chosen which workspace they are working in; sending them to
 * whichever role the join happened to return first would undo that choice on
 * every navigation, and the choice is the entire point of the role switcher.
 */
export function handleNavigate(
  roles: LoginRole[],
  activeRole?: UserRoleType | null
): string {
  // No roles is a real state — an account can be created and activated before
  // anyone grants it one. It resolves to `/app`, which explains the situation,
  // rather than to the public landing page, which would make a successful
  // sign-in look like a failed one.
  if (!roles.length) return ROUTES.app;

  const active =
    activeRole && roles.some((role) => role.name === activeRole)
      ? activeRole
      : roles[0].name;

  return ROLE_HOME[active] ?? ROUTES.app;
}

/** ISO date (YYYY-MM-DD, optionally with time) → dd/mm/yyyy. */
export function formatDMY(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

/**
 * Pretty date-time: day-first date + 12-hour clock with AM/PM,
 * e.g. "7 Jul 2026, 1:00 PM". Returns "—" for an invalid input.
 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const date = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${date}, ${time}`;
}

/** Initials for an avatar fallback, e.g. "Nilesh Kulkarni" → "NK". */
export function initialsOf(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
