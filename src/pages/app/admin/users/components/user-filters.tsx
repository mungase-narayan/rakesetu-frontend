import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, FilterRemoveIcon } from '@hugeicons/core-free-icons';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AVAILABLE_USER_ROLES,
  USER_ROLE_LABELS,
  USER_STATUSES,
} from '@/constants';
import type { UserRoleType, UserStatus } from '@/types/user-admin.types';

/** Radix Select cannot hold an empty string value, so "all" is the sentinel. */
const ALL = '__all__';

interface UserFiltersProps {
  search: string;
  status: UserStatus | '';
  role: UserRoleType | '';
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: UserStatus | '') => void;
  onRoleChange: (value: UserRoleType | '') => void;
  onClearFilters: () => void;
}

const UserFilters = ({
  search,
  status,
  role,
  hasFilters,
  onSearchChange,
  onStatusChange,
  onRoleChange,
  onClearFilters,
}: UserFiltersProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="relative min-w-52 flex-1">
      <HugeiconsIcon
        icon={Search01Icon}
        size={15}
        strokeWidth={2}
        className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by name or email"
        className="pl-9"
        aria-label="Search users"
      />
    </div>

    <Select
      value={status || ALL}
      onValueChange={(value) =>
        onStatusChange(value === ALL ? '' : (value as UserStatus))
      }
    >
      <SelectTrigger className="w-40" aria-label="Filter by status">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All statuses</SelectItem>
        {USER_STATUSES.map((value) => (
          <SelectItem key={value} value={value} className="capitalize">
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Select
      value={role || ALL}
      onValueChange={(value) =>
        onRoleChange(value === ALL ? '' : (value as UserRoleType))
      }
    >
      <SelectTrigger className="w-48" aria-label="Filter by role">
        <SelectValue placeholder="Role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All roles</SelectItem>
        {AVAILABLE_USER_ROLES.map((value) => (
          <SelectItem key={value} value={value}>
            {USER_ROLE_LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {hasFilters && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearFilters}
        className="gap-1.5 text-muted-foreground"
      >
        <HugeiconsIcon icon={FilterRemoveIcon} size={15} strokeWidth={2} />
        Clear
      </Button>
    )}
  </div>
);

export default UserFilters;
