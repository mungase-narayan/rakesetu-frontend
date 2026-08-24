const storage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) =>
    Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
};
import { persistReducer, persistStore } from 'redux-persist';
import {
  type Action,
  type ThunkAction,
  configureStore,
  combineReducers,
} from '@reduxjs/toolkit';

import { appEnv, NODE_ENV } from '@/constants';
import authSlice from '@/store/slices/auth-slice.ts';

const rootReducer = combineReducers({
  auth: authSlice,
});

/**
 * What survives a reload. The whole `auth` slice is persisted — which is safe
 * only because `Tokens` no longer carries the refresh token: that one lives in
 * an httpOnly cookie the browser manages. The access token is short-lived and
 * has to be readable by the axios interceptor, so it stays here.
 *
 * If a slice is ever added that holds anything longer-lived than an access
 * token, allowlist explicitly with `whitelist` rather than widening this.
 */
const persistConfig = {
  key: 'rakesetu',
  storage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/FLUSH',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  devTools: appEnv.NODE_ENV === NODE_ENV.DEVELOPMENT,
});

type AppDispatch = typeof store.dispatch;
type RootState = ReturnType<typeof store.getState>;
type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export { type AppDispatch, type RootState, type AppThunk };

export const persistor = persistStore(store);
export default store;

export {
  setAuth,
  syncProfile,
  logout,
  setUser,
  updateUser,
  setActiveRole,
  setAccessToken,
} from './slices/auth-slice';
