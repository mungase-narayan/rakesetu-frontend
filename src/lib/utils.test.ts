import { describe, expect, it } from 'vitest';

import { ROLE_HOME, handleNavigate } from '@/lib/utils';
import { ROUTES } from '@/routes/route-paths';
import type { LoginRole, UserRoleType } from '@/types/user.types';

const grants = (...names: UserRoleType[]): LoginRole[] =>
  names.map((name, index) => ({ name, userRoleId: `ur-${index}` }));

describe('handleNavigate', () => {
  it('sends each role to its own workspace', () => {
    expect(handleNavigate(grants('admin'))).toBe(ROUTES.admin.dashboard);
    expect(handleNavigate(grants('zonal_manager'))).toBe(
      ROUTES.zonal.dashboard
    );
    expect(handleNavigate(grants('freight_controller'))).toBe(
      ROUTES.controller.dashboard
    );
    expect(handleNavigate(grants('terminal_supervisor'))).toBe(
      ROUTES.terminal.dashboard
    );
    expect(handleNavigate(grants('commercial_officer'))).toBe(
      ROUTES.commercial.dashboard
    );
    expect(handleNavigate(grants('freight_customer'))).toBe(
      ROUTES.customer.dashboard
    );
  });

  it('gives all six roles a distinct home', () => {
    const homes = Object.values(ROLE_HOME);
    expect(new Set(homes).size).toBe(homes.length);
  });

  it('prefers activeRole over the first grant for a multi-role user', () => {
    const held = grants('freight_controller', 'terminal_supervisor');

    expect(handleNavigate(held, 'terminal_supervisor')).toBe(
      ROUTES.terminal.dashboard
    );
    expect(handleNavigate(held, 'freight_controller')).toBe(
      ROUTES.controller.dashboard
    );
  });

  it('falls back to the first grant when activeRole is stale or absent', () => {
    const held = grants('freight_controller', 'terminal_supervisor');

    expect(handleNavigate(held, null)).toBe(ROUTES.controller.dashboard);
    // A role revoked server-side must not strand the user on a 403.
    expect(handleNavigate(held, 'admin')).toBe(ROUTES.controller.dashboard);
  });

  it('sends a user with no roles into the app, not to the landing page', () => {
    // An account can be created and activated before anyone grants it a role.
    // `/app` explains that; `/` would make a successful sign-in look failed.
    expect(handleNavigate([])).toBe(ROUTES.app);
  });
});
