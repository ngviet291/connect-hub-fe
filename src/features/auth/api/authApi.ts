import axiosClient from "../../../config/axiosClient";
import publicClient from "../../../config/publicClient";
import { AUTH_ENDPOINTS } from "../util/AuthEndpoints";
import { getErrorMessage } from "../../../constants/errorMessage";
import i18n from "../../../i18n/i18n";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LogoutRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "../types/auth.types";

type ApiResponse<T> = { data: T; code: number; message: string };

const AUTH_CODE = {
  REGISTER_SUCCESS: 1000,
  LOGIN_SUCCESS: 1001,
  LOGOUT_SUCCESS: 1002,
  TOKEN_REFRESH_SUCCESS: 1003,
  PASSWORD_CHANGE_SUCCESS: 1004,
  INTROSPECT_SUCCESS: 1005,
} as const;

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const res = await publicClient.post<ApiResponse<AuthResponse>>(
        AUTH_ENDPOINTS.LOGIN,
        data,
      );
      const resData = res.data;
      if (resData.code !== AUTH_CODE.LOGIN_SUCCESS) {
        throw new Error(resData.message || i18n.t("error_login_failed"));
      }
      return resData.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_login_failed")));
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const res = await publicClient.post<ApiResponse<AuthResponse>>(
        AUTH_ENDPOINTS.REGISTER,
        data,
      );
      const resData = res.data;
      if (resData.code !== AUTH_CODE.REGISTER_SUCCESS) {
        throw new Error(resData.message || i18n.t("error_register_failed"));
      }
      return resData.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_register_failed")));
    }
  },

  logout: async (data: LogoutRequest): Promise<void> => {
    try {
      const res = await axiosClient.post<ApiResponse<null>>(
        AUTH_ENDPOINTS.LOGOUT,
        data,
      );
      const resData = res.data;
      if (resData.code !== AUTH_CODE.LOGOUT_SUCCESS) {
        throw new Error(resData.message || i18n.t("error_logout_failed"));
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_logout_failed")));
    }
  },

  forgotPassword: async (
    data: ForgotPasswordRequest,
  ): Promise<{ sent: boolean }> => {
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

  resetPassword: async (
    data: ResetPasswordRequest,
  ): Promise<{ success: boolean }> => {
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

  verifyEmail: async (
    data: VerifyEmailRequest,
  ): Promise<{ verified: boolean }> => {
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
  resendVerification: async (): Promise<{ sent: boolean }> => {
    try {
      const res = await publicClient.post<ApiResponse<{ sent: boolean }>>(
        AUTH_ENDPOINTS.RESEND_OTP,
      );
      return res.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_resend_failed")));
    }
  },
};
