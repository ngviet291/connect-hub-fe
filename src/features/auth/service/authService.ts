import publicClient from "../../../config/publicClient";
import { AUTH_ENDPOINTS } from "../util/AuthEndpoints";
import { store } from "../../../app/store";
import {
  setTokens,
  setUser,
  logout as logoutAction,
  setCurrentUser,
} from "../store/authSlice";
import { authApi } from "../api/authApi";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "../types/auth.types";

type ApiResponse<T> = { data: T; code: number; message: string };

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const saveAuth = (res: Awaited<ReturnType<typeof authApi.login>>) => {
  store.dispatch(
    setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken }),
  );
  store.dispatch(
    setUser({
      email: res.user.email,
      role: res.user.roles[0],
      fullName: res.user.fullName,
    }),
  );
  store.dispatch(setCurrentUser(res.user));
};

export const authService = {
  login: async (data: LoginRequest) => {
    const res = await authApi.login(data);
    saveAuth(res);
  },

  register: async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    saveAuth(res);
  },

  logout: async () => {
    const { accessToken, refreshToken } = store.getState().auth;
    try {
      await authApi.logout({
        accessToken: accessToken!,
        refreshToken: refreshToken!,
      });
    } finally {
      store.dispatch(logoutAction());
    }
  },

  forgotPassword: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  resetPassword: (data: ResetPasswordRequest) => authApi.resetPassword(data),
  verifyEmail: (data: VerifyEmailRequest) => authApi.verifyEmail(data),
  resendVerification: () => authApi.resendVerification(),

  // Refresh token (dùng publicClient tránh circular dep với axiosClient)
  refreshToken: async (data: { refreshToken: string }): Promise<TokenPair> => {
    const res = await publicClient.post<ApiResponse<TokenPair>>(
      AUTH_ENDPOINTS.REFRESH_TOKEN,
      data,
    );
    if (res.data.code !== 1003) {
      throw new Error(res.data.message);
    }
    return res.data.data;
  },
};
