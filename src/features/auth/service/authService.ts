import axiosClient from "../../../config/axiosClient";
import publicClient from "../../../config/publicClient";
import { store } from "../../../app/store";
import {
  setTokens,
  setUser,
  logout as logoutAction,
  setCurrentUser,
} from "../store/authSlice";
import { getErrorMessage } from "../../../constants/errorMessage";
import i18n from "../../../i18n/i18n";
import { AUTH_ENDPOINTS } from "../util/AuthEndpoints";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "../types/auth.types";

export type ApiResponse<T> = { data: T; code: number; message: string };

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const AUTH_CODE = {
  REGISTER_SUCCESS: 1000,
  LOGIN_SUCCESS: 1001,
  LOGOUT_SUCCESS: 1002,
  TOKEN_REFRESH_SUCCESS: 1003,
  PASSWORD_CHANGE_SUCCESS: 1004,
  INTROSPECT_SUCCESS: 1005,
} as const;

const saveAuth = (user: AuthResponse) => {
  store.dispatch(
    setTokens({
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    }),
  );
  store.dispatch(
    setUser({
      email: user.user.email,
      role: user.user.roles[0],
      fullName: user.user.fullName,
    }),
  );
  store.dispatch(setCurrentUser(user.user));
};

export const authService = {
  login: async (data: LoginRequest) => {
    try {
      const res = await publicClient.post<ApiResponse<AuthResponse>>(
        AUTH_ENDPOINTS.LOGIN,
        data,
      );
      if (res.data.code !== AUTH_CODE.LOGIN_SUCCESS) {
        throw new Error(res.data.message || i18n.t("error_login_failed"));
      }
      saveAuth(res.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_login_failed")));
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      const res = await publicClient.post<ApiResponse<AuthResponse>>(
        AUTH_ENDPOINTS.REGISTER,
        data,
      );
      if (res.data.code !== AUTH_CODE.REGISTER_SUCCESS) {
        throw new Error(res.data.message || i18n.t("error_register_failed"));
      }
      saveAuth(res.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_register_failed")));
    }
  },

  logout: async () => {
    const { accessToken, refreshToken } = store.getState().auth;
    try {
      const res = await axiosClient.post<ApiResponse<null>>(
        AUTH_ENDPOINTS.LOGOUT,
        { accessToken: accessToken!, refreshToken: refreshToken! },
      );
      if (res.data.code !== AUTH_CODE.LOGOUT_SUCCESS) {
        throw new Error(res.data.message || i18n.t("error_logout_failed"));
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_logout_failed")));
    } finally {
      store.dispatch(logoutAction());
    }
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    try {
      const res = await publicClient.post<ApiResponse<{ sent: boolean }>>(
        AUTH_ENDPOINTS.FORGOT_PASSWORD,
        data,
      );
      return res.data.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, i18n.t("error_forgot_password_failed")),
      );
    }
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    try {
      const res = await publicClient.post<ApiResponse<{ success: boolean }>>(
        AUTH_ENDPOINTS.RESET_PASSWORD,
        data,
      );
      return res.data.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, i18n.t("error_reset_password_failed")),
      );
    }
  },

  verifyEmail: async (data: VerifyEmailRequest) => {
    try {
      const res = await publicClient.post<ApiResponse<{ verified: boolean }>>(
        AUTH_ENDPOINTS.VERIFY_EMAIL,
        data,
      );
      return res.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("verify_error")));
    }
  },

  resendVerification: async () => {
    try {
      const res = await publicClient.post<ApiResponse<{ sent: boolean }>>(
        AUTH_ENDPOINTS.RESEND_OTP,
      );
      return res.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_resend_failed")));
    }
  },

  // dùng publicClient tránh circular dep với axiosClient
  refreshToken: async (data: { refreshToken: string }): Promise<TokenPair> => {
    try {
      const res = await publicClient.post<ApiResponse<TokenPair>>(
        AUTH_ENDPOINTS.REFRESH_TOKEN,
        data,
      );
      if (res.data.code !== AUTH_CODE.TOKEN_REFRESH_SUCCESS) {
        throw new Error(res.data.message || i18n.t("error_login_failed"));
      }
      return res.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_login_failed")));
    }
  },
};
