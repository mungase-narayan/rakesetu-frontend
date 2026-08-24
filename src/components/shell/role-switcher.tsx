import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, Tick02Icon } from '@hugeicons/core-free-icons';

import { useAuth } from '@/hooks';
import { setActiveRole } from '@/store';
import { USER_ROLE_LABELS } from '@/constants';
import { ROLE_HOME } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserRoleType } from '@/types/user.types';

/**
 * Workspace switcher for accounts holding more than one role.
 *
 * Renders nothing for the single-role case, which is every seeded persona but
 * one — and that one exists precisely so this path is exercised. DESIGN.md
 * §4.1 allows several grants, and without a switcher a two-role user would be
 * permanently stuck in whichever workspace the role join returned first.
 *
 * Switching moves `activeRole` **and** navigates, because the two disagreeing
 * is the confusing state: a header saying "Terminal Supervisor" over a
 * controller's screens explains nothing to the person reading it.
 */
const RoleSwitcher = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roles, activeRole } = useAuth();

  if (roles.length < 2) return null;

  const current = activeRole ?? roles[0].name;

  const onSelect = (role: UserRoleType) => {
    if (role === current) return;
    dispatch(setActiveRole(role));
    navigate(ROLE_HOME[role], { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden gap-1.5 sm:flex">
          <span className="text-xs font-medium">
            {USER_ROLE_LABELS[current]}
          </span>
          <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={2.2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Switch workspace
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.userRoleId}
            onClick={() => onSelect(role.name)}
            className="gap-2"
          >
            <HugeiconsIcon
              icon={Tick02Icon}
              size={15}
              strokeWidth={2.4}
              className={role.name === current ? 'text-primary' : 'opacity-0'}
            />
            {USER_ROLE_LABELS[role.name]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleSwitcher;
