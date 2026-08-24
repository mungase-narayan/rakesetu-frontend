import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import { render, type RenderOptions } from '@testing-library/react';

import { TooltipProvider } from '@/components/ui/tooltip';

import authReducer from '@/store/slices/auth-slice';
import type {
  LoginRole,
  Organization,
  Permission,
  User,
  UserRoleType,
} from '@/types/user.types';

export interface AuthStateOverrides {
  isAuth?: boolean;
  roles?: UserRoleType[];
  permissions?: Permission[];
  activeRole?: UserRoleType | null;
  user?: Partial<User>;
  organization?: Organization | null;
}

const roleGrant = (name: UserRoleType, index: number): LoginRole => ({
  name,
  userRoleId: `user-role-${index}`,
});

/**
 * A store holding exactly the auth slice, seeded to whatever the test needs.
 *
 * A real reducer rather than a mocked `useSelector`: the components under test
 * read the slice through `useAuth`, and mocking that away would leave the
 * slice's own shape — which `syncProfile` has just been taught to touch —
 * untested by anything.
 */
export const makeStore = (overrides: AuthStateOverrides = {}) => {
  const roles = (overrides.roles ?? []).map(roleGrant);

  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: {
          id: 'user-1',
          orgId: 'org-1',
          firstName: 'Test',
          middleName: null,
          lastName: 'User',
          fullName: 'Test User',
          email: 'test@cr.rakesetu.dev',
          username: 'test@cr.rakesetu.dev',
          isEmailVerified: true,
          avatar: null,
          status: 'active' as const,
          ...overrides.user,
        },
        organization:
          overrides.organization === undefined
            ? {
                id: 'org-1',
                code: 'CR',
                name: 'Central Railway',
                type: 'railway_zone' as const,
                status: 'active' as const,
              }
            : overrides.organization,
        roles,
        permissions: overrides.permissions ?? [],
        tokens: { accessToken: 'test-token' },
        isAuth: overrides.isAuth ?? true,
        activeRole:
          overrides.activeRole === undefined
            ? (roles[0]?.name ?? null)
            : overrides.activeRole,
      },
    },
  });
};

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  auth?: AuthStateOverrides;
  /** Initial history entries for the MemoryRouter. */
  route?: string;
}

export const renderWithProviders = (
  ui: ReactElement,
  { auth, route = '/', ...options }: RenderWithProvidersOptions = {}
) => {
  const store = makeStore(auth);

  // The provider stack mirrors App.tsx deliberately. A harness that renders a
  // component under *fewer* providers than production passes on markup the real
  // app throws on — which is exactly how a missing TooltipProvider reached a
  // browser once already.
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <TooltipProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </TooltipProvider>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
};

// Re-exported so a suite has one import for both the helper and the queries.
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
