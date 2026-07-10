import axiosClient from '../../../config/axiosClient';
import publicClient from '../../../config/publicClient';
import { AUTH_ENDPOINTS } from '../auth_endpoints';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LogoutRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '../types/auth.types';

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
export const authApi = {
  login: (data: LoginRequest) =>
    publicClient.post<ApiResponse<AuthResponse>>(AUTH_ENDPOINTS.LOGIN, data),

  register: (data: RegisterRequest) =>
    publicClient.post<ApiResponse<AuthResponse>>(AUTH_ENDPOINTS.REGISTER, data),

  logout: (data: LogoutRequest) =>
    axiosClient.post<ApiResponse<null>>(AUTH_ENDPOINTS.LOGOUT, data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    publicClient.post<ApiResponse<{ sent: boolean }>>(AUTH_ENDPOINTS.FORGOT_PASSWORD, data),

  resetPassword: (data: ResetPasswordRequest) =>
    publicClient.post<ApiResponse<{ success: boolean }>>(AUTH_ENDPOINTS.RESET_PASSWORD, data),

  verifyEmail: (data: VerifyEmailRequest) =>
    publicClient.post<ApiResponse<{ verified: boolean }>>(AUTH_ENDPOINTS.VERIFY_EMAIL, data),

  resendVerification: () =>
    publicClient.post<ApiResponse<{ sent: boolean }>>(AUTH_ENDPOINTS.RESEND_OTP),

  // dùng publicClient tránh circular dep với axiosClient
  refreshToken: (data: { refreshToken: string }) =>
    publicClient.post<ApiResponse<TokenPair>>(AUTH_ENDPOINTS.REFRESH_TOKEN, data),
};