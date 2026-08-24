import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

import { Can } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AVAILABLE_USER_ROLES, USER_ROLE_LABELS } from '@/constants';
import type {
  AdminUser,
  AdminUserRole,
  UserRoleType,
} from '@/types/user-admin.types';

interface UserRolesCellProps {
  user: AdminUser;
  onAssign: (user: AdminUser, role: UserRoleType) => void;
  onRevoke: (user: AdminUser, grant: AdminUserRole) => void;
}

/**
 * Role grants, editable in place.
 *
 * A separate screen for "assign a role" would be a navigation for a one-field
 * decision. The revoke path still goes through `<ConfirmDialog>` upstream —
 * removing someone's ability to approve an indent at 3 a.m. is not a click to
 * take back by accident.
 */
const UserRolesCell = ({ user, onAssign, onRevoke }: UserRolesCellProps) => {
  const held = new Set(user.roles.map((role) => role.name));
  const available = AVAILABLE_USER_ROLES.filter((role) => !held.has(role));

  return (
    <div
      className="flex flex-wrap items-center gap-1"
      // The row itself has no click handler on this screen, but the dropdown
      // inside it must not bubble into one if a later phase adds it.
      onClick={(event) => event.stopPropagation()}
    >
      {user.roles.length === 0 && (
        <span className="text-xs text-muted-foreground">No role</span>
      )}

      {user.roles.map((grant) => (
        <Badge
          key={grant.userRoleId}
          variant="secondary"
          className="gap-1 pr-1"
        >
          {USER_ROLE_LABELS[grant.name]}
          <Can permission="user:write">
            <button
              type="button"
              onClick={() => onRevoke(user, grant)}
              aria-label={`Revoke ${USER_ROLE_LABELS[grant.name]}`}
              className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={11} strokeWidth={2.6} />
            </button>
          </Can>
        </Badge>
      ))}

      <Can permission="user:write">
        {available.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground"
                aria-label="Assign a role"
              >
                <HugeiconsIcon icon={Add01Icon} size={13} strokeWidth={2.4} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Assign a role
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {available.map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => onAssign(user, role)}
                >
                  {USER_ROLE_LABELS[role]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Can>
    </div>
  );
};

export default UserRolesCell;
