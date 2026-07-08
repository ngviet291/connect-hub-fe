import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../app/store";
import type { UserRole } from "../../user/types/user.types.ts";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  email: string | null;
  isAuthenticated: boolean;
  fullName?: string | null;
}

const loadFromStorage = (): AuthState => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const role = localStorage.getItem("role") as UserRole | null;
  const email = localStorage.getItem("email");
  const fullName = localStorage.getItem("fullName");

  return {
    accessToken,
    refreshToken,
    role,
    email,
    fullName,
    isAuthenticated: !!accessToken,
  };
};

const initialState: AuthState = loadFromStorage();

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    },
    setUser: (
      state,
      action: PayloadAction<{
        email: string;
        role: UserRole;
        fullName: string;
      }>,
    ) => {
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.fullName = action.payload.fullName;
      localStorage.setItem("email", action.payload.email);
      localStorage.setItem("fullName", action.payload.fullName);
      localStorage.setItem("role", action.payload.role);
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.email = null;
      state.role = null;
      state.fullName = null;
      state.isAuthenticated = false;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("fullName");
    },
    hydrate: (state) => {
      state.accessToken = localStorage.getItem("accessToken");
      state.refreshToken = localStorage.getItem("refreshToken");
      state.email = localStorage.getItem("email");
      state.role = localStorage.getItem("role") as UserRole;
      state.fullName = localStorage.getItem("fullName");
      state.isAuthenticated = !!state.accessToken;
    },
  },
});

export const { setTokens, setUser, logout, hydrate } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;

export const selectCurrentUser = (state: RootState) => {
  if (!state.auth.isAuthenticated) return null;
  return state.auth;
};

export default authSlice.reducer;