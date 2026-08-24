import type { ORGANIZATION_TYPES } from '@/constants';

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

/**
 * Mirrors the backend's LoginOrganizationDto — the trimmed organization shape
 * returned by both /users/login and /users/me.
 */
export interface Organization {
  id: string;
  code: string;
  name: string;
  type: OrganizationType;
  status: string;
}
