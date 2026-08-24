import type { ReactNode } from 'react';
import type { IconSvgElement } from '@hugeicons/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Building03Icon } from '@hugeicons/core-free-icons';

import { useAuth } from '@/hooks';
import { USER_ROLE_LABELS } from '@/constants';
import { Badge } from '@/components/ui/badge';
import { PageHeader, StatTile } from '@/components/shared';
import type { UserRoleType } from '@/types/user.types';

/**
 * One tile on a workspace dashboard.
 *
 * `pendingPhase` and `value` are the two states, and there is deliberately no
 * third: either a number came from an endpoint, or the tile names the phase
 * that will make one. Nothing on any dashboard in this build is a hardcoded
 * figure dressed as data.
 */
export interface DashboardTile {
  label: string;
  icon?: IconSvgElement;
  value?: number | string | null;
  hint?: string;
  isLoading?: boolean;
  pendingPhase?: number;
}

interface DashboardShellProps {
  role: UserRoleType;
  title: string;
  description: string;
  tiles: DashboardTile[];
  /** The activity panel below the tiles. */
  children?: ReactNode;
}

/** The frame all six workspace dashboards share. */
const DashboardShell = ({
  role,
  title,
  description,
  tiles,
  children,
}: DashboardShellProps) => {
  const { user, organization } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={<Badge variant="secondary">{USER_ROLE_LABELS[role]}</Badge>}
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>
          Signed in as{' '}
          <span className="font-medium text-foreground">{user?.fullName}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon icon={Building03Icon} size={14} strokeWidth={2} />
          {organization?.name}
          {organization?.code && (
            <span className="text-muted-foreground/60">
              ({organization.code})
            </span>
          )}
        </span>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </section>

      {children}
    </div>
  );
};

export default DashboardShell;
