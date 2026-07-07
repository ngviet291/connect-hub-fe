import axiosClient from "../../config/axiosClient";
import { API_ENDPOINTS } from "../../config/endpoints";
import type { ApiResponse } from "../../types/api.type";
import { getErrorMessage } from "../../constants/errorMessage";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: string;
  fullName: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export const authService = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    try {
      const res = await axiosClient.post<ApiResponse<LoginResponse>>(
        API_ENDPOINTS.LOGIN,
        request,
      );

      const data = res.data;

      if (data.code !== 6000) {
        throw new Error(data.message);
      }

      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Đăng nhập thất bại"));
    }
  },

  register: async (request: RegisterRequest): Promise<void> => {
    try {
      const res = await axiosClient.post<ApiResponse<void>>(
        API_ENDPOINTS.REGISTER,
        request,
      );

      if (res.data.code !== 6001) {
        throw new Error(res.data.message);
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, "Đăng ký thất bại"));
    }
  },

  refreshToken: async (
  request: { refreshToken: string }
): Promise<{ accessToken: string; refreshToken: string }> => {
  const res = await axiosClient.post(
    API_ENDPOINTS.REFRESH_TOKEN,
    request
  );

  return res.data.data;
},

  logout: async (): Promise<void> => {
    try {
      await axiosClient.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error(error);
    }
  },
};