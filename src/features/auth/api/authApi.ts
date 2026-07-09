import axiosClient from '../../../config/axiosClient';
import { API_ENDPOINTS } from '../../../config/endpoints';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LogoutRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '../types/auth.types';

/** Shape wrapper backend trả về: ApiResponse<T> = { code, data, message } */
type ApiResponse<T> = { data: T; code: number; message: string };

export const authApi = {
  /**
   * Đăng nhập — emailOrUsername chấp nhận cả email lẫn username,
   * backend tự phân biệt.
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.LOGIN, data);
    return res.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.REGISTER, data);
    return res.data.data;
  },

  logout: async (data: LogoutRequest): Promise<void> => {
    await axiosClient.post(API_ENDPOINTS.LOGOUT, data);
  },
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ sent: boolean }> => {
    const res = await axiosClient.post<ApiResponse<{ sent: boolean }>>(
      API_ENDPOINTS.FORGOT_PASSWORD,
      data,
    );
    return res.data.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ success: boolean }> => {
    const res = await axiosClient.post<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.RESET_PASSWORD,
      data,
    );
    return res.data.data;
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<{ verified: boolean }> => {
    const res = await axiosClient.post<ApiResponse<{ verified: boolean }>>(
      API_ENDPOINTS.VERIFY_EMAIL,
      data,
    );
    return res.data.data;
  },

  resendVerification: async (): Promise<{ sent: boolean }> => {
    const res = await axiosClient.post<ApiResponse<{ sent: boolean }>>(API_ENDPOINTS.RESEND_OTP);
    return res.data.data;
  },
};
