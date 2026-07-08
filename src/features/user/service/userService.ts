import axiosClient from "../../../config/axiosClient";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type { ApiResponse, PaginationResponse }  from "../../../types/api.type";
import { getErrorMessage } from "../../../constants/errorMessage";
import type { UserProfile } from "../types/user.types";
import type { UUID } from "../../../shared/types/common.types";

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const res = await axiosClient.get<ApiResponse<UserProfile>>(
        API_ENDPOINTS.PROFILE,
      );
      const data = res.data;
      if (data.code !== 7000) {
        throw new Error(data.message || "Lỗi khi tải thông tin người dùng");
      }
      return data.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Lỗi khi tải thông tin người dùng"),
      );
    }
  },
  updateProfile: async (request: {
    fullName: string;
    phone: string;
  }): Promise<UserProfile> => {
    try {
      const res = await axiosClient.put<ApiResponse<UserProfile>>(
        API_ENDPOINTS.PROFILE,
        request,
      );
      const data = res.data;
      if (data.code !== 7001) {
        throw new Error(
          data.message || "Lỗi khi cập nhật thông tin người dùng",
        );
      }
      return data.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Lỗi khi cập nhật thông tin người dùng"),
      );
    }
  },

  getUsers: async (
    page: number,
    size: number,
  ): Promise<PaginationResponse<UserProfile>> => {
    try {
      const res = await axiosClient.get<ApiResponse<PaginationResponse<UserProfile>>>(
        API_ENDPOINTS.ADMIN_USERS,
        {
          params: { page, size },
        },
      );
      const data = res.data;
      if (data.code !== 7002) {
        throw new Error(data.message || "Lỗi khi tải danh sách người dùng");
      }

      return data.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Lỗi khi tải danh sách người dùng"),
      );
    }
  },

  toggleActive: async (id: UUID, isLock: boolean): Promise<void> => {
    try {
      if (isLock) {
        const res = await axiosClient.put<ApiResponse<null>>(
          API_ENDPOINTS.ADMIN_USERS_LOCK(id),
        );
        const data = res.data;
        if (data.code !== 7003) {
          throw new Error(data.message || "Lỗi khi khóa người dùng");
        }
      } else {
        const res = await axiosClient.put<ApiResponse<null>>(
          API_ENDPOINTS.ADMIN_USERS_UNLOCK(id),
        );
        const data = res.data;
        if (data.code !== 7004) {
          throw new Error(data.message || "Lỗi khi mở khóa người dùng");
        }
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, "Lỗi khi khóa người dùng"));
    }
  },
};