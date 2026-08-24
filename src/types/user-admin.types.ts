import type { InvitationResult } from './invitation.types';
import type { PaginationParams } from './pagination.types';
import type { UserRoleType, UserStatus } from './user.types';

export type { UserRoleType, UserStatus };

/** Mirrors the backend's AdminUserRoleDto. */
export interface AdminUserRole {
  userRoleId: string;
  roleId: string;
  name: UserRoleType;
}

/**
 * Mirrors the backend's AdminUserDto — the *directory* view of a person, as
 * distinct from `User`, which is the self view returned by login and `/me`.
 */
export interface AdminUser {
  id: string;
  orgId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string | null;
  email: string;
  username: string;
  phone: string | null;
  status: UserStatus;
  isEmailVerified: boolean;
  /**
   * False for an account created here: this API sets no password, so the row
   * exists but nobody can sign in as it yet. The table says "invitation
   * pending" rather than implying the person simply has not logged in.
   */
  hasPassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  roles: AdminUserRole[];
  /**
   * What became of the most recent invitation email, or null if none was ever
   * queued. `hasPassword` already answers "did they get in"; this answers the
   * one it cannot — *why not* — because a failed send and an unopened inbox
   * look identical from the outside and only one is the admin's to fix.
   */
  lastInvitation?: AdminUserInvitation | null;
  /** Present only on the create response — the job queued for the invitation. */
  invitation?: InvitationResult | null;
}

/** Mirrors the backend's AdminUserInvitationDto. */
export interface AdminUserInvitation {
  status: 'queued' | 'sending' | 'sent' | 'failed';
  attempts: number;
  lastError: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface ListUsersQuery extends PaginationParams {
  search?: string;
  status?: UserStatus;
  role?: UserRoleType;
}

export interface CreateUserBody {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  phone?: string | null;
  role?: UserRoleType;
}

export interface UpdateUserBody {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  phone?: string | null;
  status?: UserStatus;
}

export interface AssignRoleBody {
  role: UserRoleType;
}
