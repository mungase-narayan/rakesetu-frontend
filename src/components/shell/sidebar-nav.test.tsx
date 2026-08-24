import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import SidebarNav from '@/components/shell/sidebar-nav';
import { NAVIGATION } from '@/constants';
import { renderWithProviders } from '@/test/render';
import type { Permission, UserRoleType } from '@/types/user.types';

/** Every permission the role's own nav entries ask for. */
const permissionsFor = (role: UserRoleType): Permission[] =>
  NAVIGATION[role]
    .flatMap((section) => section.items)
    .map((item) => item.permission)
    .filter((p): p is Permission => Boolean(p));

describe('<SidebarNav>', () => {
  it('renders a role its own items and nothing from another tree', () => {
    renderWithProviders(<SidebarNav role="freight_controller" />, {
      auth: {
        roles: ['freight_controller'],
        permissions: permissionsFor('freight_controller'),
      },
    });

    expect(screen.getByText('Allotment board')).toBeInTheDocument();
    expect(screen.getByText('Indent queue')).toBeInTheDocument();
    // The commercial desk's items live in a different tree entirely.
    expect(screen.queryByText('Waivers')).toBeNull();
    expect(screen.queryByText('Users & roles')).toBeNull();
  });

  it('hides an item whose permission the user does not hold', () => {
    renderWithProviders(<SidebarNav role="admin" />, {
      auth: {
        roles: ['admin'],
        // Deliberately partial: an admin normally holds everything, so the
        // only way to assert the filter is to take something away.
        permissions: ['user:read'],
      },
    });

    expect(screen.getByText('Users & roles')).toBeInTheDocument();
    expect(screen.queryByText('Audit log')).toBeNull();
  });

  it('always renders the unguarded dashboard entry', () => {
    renderWithProviders(<SidebarNav role="zonal_manager" />, {
      auth: { roles: ['zonal_manager'], permissions: [] },
    });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders a pending item as disabled text rather than a link', () => {
    renderWithProviders(<SidebarNav role="freight_customer" />, {
      auth: {
        roles: ['freight_customer'],
        permissions: permissionsFor('freight_customer'),
      },
    });

    const pending = screen.getByText('My indents').closest('[aria-disabled]');
    expect(pending).not.toBeNull();
    // A link to a screen that does not exist yet would 404; a labelled
    // placeholder says what is actually true.
    expect(screen.queryByRole('link', { name: /My indents/ })).toBeNull();
  });

  it('keeps real classes on the links when collapsed', () => {
    // The regression this guards: the collapsed rail wraps each link in a Radix
    // `TooltipTrigger asChild`, and Slot merges className by string-joining. A
    // `NavLink className={({ isActive }) => …}` render prop therefore lands on
    // the element as its own source text, stripping every Tailwind class and
    // collapsing the row to an unstyled 18px inline box.
    renderWithProviders(<SidebarNav role="admin" collapsed />, {
      auth: { roles: ['admin'], permissions: permissionsFor('admin') },
      route: '/app/admin/users',
    });

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      const className = link.getAttribute('class') ?? '';
      expect(className).not.toContain('=>');
      expect(className).toContain('justify-center');
      expect(className).toContain('size-9');
    }
  });

  it('marks the matching item active when collapsed', () => {
    renderWithProviders(<SidebarNav role="admin" collapsed />, {
      auth: { roles: ['admin'], permissions: permissionsFor('admin') },
      route: '/app/admin/users',
    });

    const active = screen
      .getAllByRole('link')
      .filter((el) =>
        (el.getAttribute('class') ?? '').includes('text-primary')
      );

    // Exactly one — the rail must not light up two workspaces at once.
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveAttribute('href', '/app/admin/users');
  });

  it('gives every role at least one navigable entry', () => {
    for (const role of Object.keys(NAVIGATION) as UserRoleType[]) {
      const { unmount } = renderWithProviders(<SidebarNav role={role} />, {
        auth: { roles: [role], permissions: permissionsFor(role) },
      });
      expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
      unmount();
    }
  });
});
