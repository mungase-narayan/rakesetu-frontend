import { HugeiconsIcon } from '@hugeicons/react';
import {
  SidebarLeft01Icon,
  SidebarRight01Icon,
} from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks';
import { USER_ROLE_LABELS } from '@/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import type { UserRoleType } from '@/types/user.types';

import SidebarNav from './sidebar-nav';

interface SidebarProps {
  /** The tree being rendered — not necessarily the user's own role, since an
   *  admin may be visiting another workspace. */
  role: UserRoleType;
  /** True when the viewer does not personally hold `role` — an admin visiting. */
  visiting?: boolean;
  collapsed: boolean;
  onToggle: () => void;
  /** Mobile drawer state, driven by the header's menu button. */
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  isMobile: boolean;
}

/**
 * The workspace sidebar.
 *
 * One nav list, two containers: a fixed rail on desktop that collapses to
 * icons, and a `Sheet` drawer below `md`. Rendering the same `<SidebarNav>` in
 * both is what keeps the permission filtering and the active-route highlighting
 * from having to be right twice.
 */
const Sidebar = ({
  role,
  visiting = false,
  collapsed,
  onToggle,
  mobileOpen,
  onMobileOpenChange,
  isMobile,
}: SidebarProps) => {
  const { organization } = useAuth();

  const footer = (compact: boolean) => (
    <div
      className={cn(
        'mt-auto border-t border-border/60 px-3 py-3',
        compact && 'px-2 text-center'
      )}
    >
      {compact ? (
        <Badge variant="secondary" className="px-1.5 text-[10px]">
          {organization?.code ?? '—'}
        </Badge>
      ) : (
        <div className="space-y-1.5">
          <p className="truncate text-xs font-semibold">
            {organization?.name ?? 'Freight Operations'}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[11px] font-medium">
              {USER_ROLE_LABELS[role]}
            </Badge>
            {visiting && (
              <Badge
                variant="outline"
                className="text-[10px] font-medium text-muted-foreground"
              >
                admin view
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-64 p-0">
          {/* Required by Radix for an accessible dialog, visually redundant
              next to the header that is already on screen. */}
          <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
          <div className="flex h-full flex-col pt-10">
            <SidebarNav
              role={role}
              onNavigate={() => onMobileOpenChange(false)}
            />
            {footer(false)}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        'sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 flex-col border-r border-border/60 bg-background/60 transition-[width] duration-200 md:flex',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex-1 overflow-y-auto">
        <SidebarNav role={role} collapsed={collapsed} />
      </div>

      {footer(collapsed)}

      <div className={cn('border-t border-border/60 p-2', collapsed && 'px-1')}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'w-full gap-2 text-muted-foreground',
            collapsed && 'px-0'
          )}
        >
          <HugeiconsIcon
            icon={collapsed ? SidebarRight01Icon : SidebarLeft01Icon}
            size={16}
            strokeWidth={2}
          />
          {!collapsed && <span className="text-xs">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
