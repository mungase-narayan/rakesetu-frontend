import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  LoginResponse,
  MeResponse,
  User,
  Organization,
  LoginRole,
  Permission,
  Tokens,
  UserRoleType,
} from '@/types/user.types';

interface AuthSliceType {
  user: User | null;
  organization: Organization | null;
  roles: LoginRole[];
  /**
   * The server's answer to "what may this person do".
   *
   * Persisted alongside the profile so the sidebar renders its real shape on
   * the first paint after a reload rather than flashing an empty nav while
   * `/users/me` is in flight. It is a **rendering hint and nothing more** —
   * every gated action's endpoint is guarded server-side, so editing this
   * array in devtools buys a visible button and a 403.
   */
  permissions: Permission[];
  tokens: Tokens | null;
  isAuth: boolean;
  activeRole: UserRoleType | null;
}

const initialState: AuthSliceType = {
  user: null,
  organization: null,
  roles: [],
  permissions: [],
  tokens: null,
  isAuth: false,
  activeRole: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<LoginResponse>) => {
      state.user = action.payload.user;
      state.organization = action.payload.organization;
      state.roles = action.payload.roles;
      state.permissions = action.payload.permissions ?? [];
      state.tokens = action.payload.tokens;
      state.isAuth = true;
      // Default the active role to the user's first role. A multi-role account
      // switches it from the header; `handleNavigate` prefers it over roles[0].
      state.activeRole = action.payload.roles[0]?.name ?? null;
    },

    /** Refreshes the persisted profile from GET /users/me without touching tokens. */
    syncProfile: (state, action: PayloadAction<MeResponse>) => {
      state.user = action.payload.user;
      state.organization = action.payload.organization;
      state.roles = action.payload.roles;
      state.permissions = action.payload.permissions ?? [];
      // A role revoked server-side must not leave a stale `activeRole` pointing
      // at a workspace this user can no longer enter.
      const stillHeld = action.payload.roles.some(
        (role) => role.name === state.activeRole
      );
      if (!state.activeRole || !stillHeld) {
        state.activeRole = action.payload.roles[0]?.name ?? null;
      }
    },

    setActiveRole: (state, action: PayloadAction<UserRoleType>) => {
      state.activeRole = action.payload;
    },

    setAccessToken: (state, action: PayloadAction<string>) => {
      if (state.tokens) state.tokens.accessToken = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.organization = null;
      state.roles = [];
      state.permissions = [];
      state.tokens = null;
      state.isAuth = false;
      state.activeRole = null;
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const {
  setAuth,
  syncProfile,
  logout,
  setUser,
  updateUser,
  setActiveRole,
  setAccessToken,
} = authSlice.actions;
export default authSlice.reducer;
