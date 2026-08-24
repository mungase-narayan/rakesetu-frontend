import { NavLink, useMatch } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';

import { cn } from '@/lib/utils';
import { usePermission } from '@/hooks';
import { NAVIGATION } from '@/constants';
import type { NavItem, NavSection } from '@/constants';
import type { UserRoleType } from '@/types/user.types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarNavProps {
  role: UserRoleType;
  collapsed?: boolean;
  /** Closes the mobile drawer when a link is followed. */
  onNavigate?: () => void;
}

/**
 * The navigation list itself, shared by the desktop rail and the mobile drawer.
 *
 * Items whose `permission` the signed-in user lacks are **not rendered** — not
 * disabled, not greyed. A visible link to a screen that 403s is worse than no
 * link, because it reads as a bug rather than as a boundary. Items with a
 * `pendingPhase` render disabled instead, because those are boundaries in time
 * rather than in authority, and saying so is the honest thing.
 */
const SidebarNav = ({
  role,
  collapsed = false,
  onNavigate,
}: SidebarNavProps) => {
  const { can } = usePermission();

  const sections: NavSection[] = NAVIGATION[role] ?? [];

  const visible = (item: NavItem) => !item.permission || can(item.permission);

  return (
    <nav className="flex flex-col gap-5 px-2 py-3">
      {sections.map((section, sectionIndex) => {
        const items = section.items.filter(visible);
        if (items.length === 0) return null;

        return (
          <div key={section.title ?? sectionIndex} className="space-y-1">
            {section.title && !collapsed && (
              <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                {section.title}
              </p>
            )}
            {section.title && collapsed && (
              <div className="mx-auto mb-1 w-8 border-t border-border/60" />
            )}

            {items.map((item) => (
              <SidebarNavLink
                key={`${item.label}-${item.to}`}
                item={item}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
};

const SidebarNavLink = ({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) => {
  const pending = item.pendingPhase !== undefined;

  /**
   * Active state is resolved here rather than through `NavLink`'s own
   * `className={({ isActive }) => …}` render prop, and that is not a style
   * preference.
   *
   * The collapsed rail wraps each link in a Radix `TooltipTrigger asChild`.
   * `Slot` merges the props it injects with the child's by **string-joining**
   * `className` — so a function lands on the element as its own source text,
   * every Tailwind class is stripped, and the row collapses to an unstyled
   * 18px inline box. Keeping `className` a plain string on both paths means the
   * expanded and collapsed rails cannot drift apart again.
   */
  const isActive = Boolean(useMatch({ path: item.to, end: true }));

  const body = (
    <>
      <HugeiconsIcon
        icon={item.icon}
        size={18}
        strokeWidth={2}
        className="shrink-0"
      />
      {!collapsed && (
        <>
          <span className="truncate">{item.label}</span>
          {pending && (
            <span className="ml-auto shrink-0 rounded-full border border-border/70 px-1.5 py-px text-[10px] font-medium text-muted-foreground/70">
              P{item.pendingPhase}
            </span>
          )}
        </>
      )}
    </>
  );

  const base = cn(
    'flex items-center rounded-lg text-sm font-medium transition-colors',
    collapsed
      ? // A centred 36px square: a real pointer target, and the active tint reads
        // as a badge on the rail rather than a full-width band.
        'mx-auto size-9 justify-center gap-0 p-0'
      : 'gap-3 px-3 py-2'
  );

  const element = pending ? (
    <span
      aria-disabled="true"
      className={cn(base, 'cursor-not-allowed text-muted-foreground/45')}
    >
      {body}
    </span>
  ) : (
    <NavLink
      to={item.to}
      end
      onClick={onNavigate}
      className={cn(
        base,
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      {body}
    </NavLink>
  );

  // Collapsed to icons, the label has to live somewhere.
  if (!collapsed) return element;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{element}</TooltipTrigger>
      <TooltipContent side="right">
        {item.label}
        {pending && ` — arrives in phase ${item.pendingPhase}`}
      </TooltipContent>
    </Tooltip>
  );
};

export default SidebarNav;
