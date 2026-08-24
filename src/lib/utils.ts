import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { LoginRole, UserRoleType } from '@/types/user.types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Landing path for each role after login.
 *
 * Every role currently resolves to the single placeholder dashboard. The
 * per-role workspaces this map is designed for land in a later pass:
 *   freight_customer    → /customer/dashboard
 *   freight_controller  → /controller/dashboard
 *   terminal_supervisor → /terminal/dashboard
 *   commercial_officer  → /commercial/dashboard
 *   zonal_manager       → /zonal/dashboard
 *   admin               → /admin/dashboard
 * When one of those areas exists, change its entry here — nothing else in the
 * login flow needs to move.
 */
const ROLE_HOME: Record<UserRoleType, string> = {
  admin: '/app/dashboard',
  zonal_manager: '/app/dashboard',
  freight_controller: '/app/dashboard',
  terminal_supervisor: '/app/dashboard',
  commercial_officer: '/app/dashboard',
  freight_customer: '/app/dashboard',
};

/** Resolve the home path for an authenticated user from their roles. */
export function handleNavigate(roles: LoginRole[]): string {
  return roles.length ? (ROLE_HOME[roles[0].name] ?? '/app/dashboard') : '/';
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
