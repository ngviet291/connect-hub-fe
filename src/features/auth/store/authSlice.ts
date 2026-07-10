import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type { AuthUser} from '../types/auth.types';
import type { UserRole } from '../../user/types/user.types';

interface AuthState {
  accessToken:   string | null;
  refreshToken:  string | null;
  role:          UserRole | null;
  email:         string | null;
  fullName:      string | null;
  currentUser:   AuthUser | null;
  isAuthenticated: boolean;
}

const load = (): AuthState => {
  const accessToken  = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const raw = localStorage.getItem('currentUser');
  const currentUser: AuthUser | null = raw ? JSON.parse(raw) : null;

  return {
    accessToken,
    refreshToken,
    role:     (localStorage.getItem('role') as UserRole | null),
    email:    localStorage.getItem('email'),
    fullName: localStorage.getItem('fullName'),
    currentUser,
    isAuthenticated: !!accessToken,
  };
};

const save = (key: string, value: string) => localStorage.setItem(key, value);
const drop = (...keys: string[]) => keys.forEach((k) => localStorage.removeItem(k));

export const authSlice = createSlice({
  name: 'auth',
  initialState: load(),
  reducers: {
    setTokens(state, { payload }: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken    = payload.accessToken;
      state.refreshToken   = payload.refreshToken;
      state.isAuthenticated = true;
      save('accessToken',  payload.accessToken);
      save('refreshToken', payload.refreshToken);
    },

    setUser(state, { payload }: PayloadAction<{ email: string; role: UserRole; fullName: string }>) {
      state.email    = payload.email;
      state.role     = payload.role;
      state.fullName = payload.fullName;
      save('email',    payload.email);
      save('role',     payload.role);
      save('fullName', payload.fullName);
    },

    setCurrentUser(state, { payload }: PayloadAction<AuthUser>) {
      state.currentUser = payload;
      save('currentUser', JSON.stringify(payload));
    },

    logout(state) {
      state.accessToken = state.refreshToken = state.email =
        state.role = state.fullName = state.currentUser = null;
      state.isAuthenticated = false;
      drop('accessToken', 'refreshToken', 'email', 'role', 'fullName', 'currentUser');
    },
  },
});

export const { setTokens, setUser, setCurrentUser, logout } = authSlice.actions;

export const selectAuth        = (s: RootState) => s.auth;
export const selectCurrentUser = (s: RootState) => s.auth.currentUser;
export const selectIsAuth      = (s: RootState) => s.auth.isAuthenticated;
export const selectRole        = (s: RootState) => s.auth.role;

export default authSlice.reducer;