import type { AVAILABLE_USER_ROLES, USER_STATUSES } from '@/constants';

import type { Organization } from './organization.types';

export type { Organization, OrganizationType } from './organization.types';

export type UserStatus = (typeof USER_STATUSES)[number];
export type UserRoleType = (typeof AVAILABLE_USER_ROLES)[number];

/** Mirrors the backend's LoginUserDto. */
export interface User {
  id: string;
  orgId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string | null;
  email: string;
  username: string;
  isEmailVerified: boolean;
  avatar: string | null;
  status: UserStatus;
}

export interface LoginRole {
  name: UserRoleType;
  userRoleId: string;
}

/**
 * The access token is the only token the client ever holds.
 *
 * The refresh token lives in an httpOnly, SameSite=Strict cookie the browser
 * attaches on its own — page JavaScript cannot read it, which is the point.
 * Mirrors the backend's LoginTokensDto; adding `refreshToken` back here would
 * put it into redux-persist and therefore into localStorage.
 */
export interface Tokens {
  accessToken: string;
}

/** Mirrors the backend's LoginResponseDto. */
export interface LoginResponse {
  user: User;
  organization: Organization | null;
  roles: LoginRole[];
  tokens: Tokens;
}

/** GET /users/me — the login payload minus the tokens. */
export interface MeResponse {
  user: User;
  organization: Organization | null;
  roles: LoginRole[];
}

export interface LoginBody {
  email: string;
  password: string;
}

/** POST /users/refresh. The cookie is re-sent by the browser, not by us. */
export interface RefreshResponse {
  accessToken: string;
}

export interface UpdateMyAccountBody {
  username?: string;
  avatar?: string | null;
}
