import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  LoginResponse,
  MeResponse,
  User,
  Organization,
  LoginRole,
  Tokens,
  UserRoleType,
} from '@/types/user.types';

interface AuthSliceType {
  user: User | null;
  organization: Organization | null;
  roles: LoginRole[];
  tokens: Tokens | null;
  isAuth: boolean;
  activeRole: UserRoleType | null;
}

const initialState: AuthSliceType = {
  user: null,
  organization: null,
  roles: [],
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
      state.tokens = action.payload.tokens;
      state.isAuth = true;
      // Default the active role to the user's first role. Every seeded account
      // holds exactly one; a role-selector dialog for multi-role users is a
      // documented follow-up.
      state.activeRole = action.payload.roles[0]?.name ?? null;
    },

    /** Refreshes the persisted profile from GET /users/me without touching tokens. */
    syncProfile: (state, action: PayloadAction<MeResponse>) => {
      state.user = action.payload.user;
      state.organization = action.payload.organization;
      state.roles = action.payload.roles;
      if (!state.activeRole) {
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
