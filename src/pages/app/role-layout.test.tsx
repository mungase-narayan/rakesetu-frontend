import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router';
import { screen } from '@testing-library/react';

import RoleLayout from '@/pages/app/role-layout';
import { renderWithProviders } from '@/test/render';
import type { UserRoleType } from '@/types/user.types';

const renderTree = (held: UserRoleType[], guard: UserRoleType) =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<RoleLayout role={guard} />}>
        <Route index element={<p>Controller workspace</p>} />
      </Route>
    </Routes>,
    { auth: { roles: held } }
  );

describe('<RoleLayout>', () => {
  it('renders the children for the matching role', () => {
    renderTree(['freight_controller'], 'freight_controller');
    expect(screen.getByText('Controller workspace')).toBeInTheDocument();
  });

  it('renders the 403 screen for the wrong role — and does not redirect', () => {
    renderTree(['freight_controller'], 'admin');

    expect(screen.queryByText('Controller workspace')).toBeNull();
    expect(screen.getByText('403 — Forbidden')).toBeInTheDocument();
    // The message must not suggest signing in again: the session is fine.
    expect(
      screen.getByText(/Nothing is wrong with your session/)
    ).toBeInTheDocument();
  });

  it('lets an admin into every tree', () => {
    for (const guard of [
      'freight_controller',
      'terminal_supervisor',
      'commercial_officer',
      'zonal_manager',
      'freight_customer',
    ] as UserRoleType[]) {
      const { unmount } = renderTree(['admin'], guard);
      expect(screen.getByText('Controller workspace')).toBeInTheDocument();
      unmount();
    }
  });

  it('lets a multi-role user into either of their trees', () => {
    const held: UserRoleType[] = ['freight_controller', 'terminal_supervisor'];

    const first = renderTree(held, 'freight_controller');
    expect(screen.getByText('Controller workspace')).toBeInTheDocument();
    first.unmount();

    renderTree(held, 'terminal_supervisor');
    expect(screen.getByText('Controller workspace')).toBeInTheDocument();
  });

  it('refuses a user holding no roles at all', () => {
    renderTree([], 'admin');
    expect(screen.getByText('403 — Forbidden')).toBeInTheDocument();
  });
});
