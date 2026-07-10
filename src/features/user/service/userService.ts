import axiosClient from "../../../config/axiosClient";
import { USER_ENDPOINTS } from "../user_endpoints";
import type { ApiResponse, PaginationResponse } from "../../../shared/types/api.types";
import { getErrorMessage } from "../../../constants/errorMessage";
import type { UserProfile } from "../types/user.types";
import type { UUID } from "../../../shared/types/common.types";
import i18n from "../../../i18n/i18n";

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const res = await axiosClient.get<ApiResponse<UserProfile>>(
        USER_ENDPOINTS.PROFILE,
      );
      const data = res.data;
      if (data.code !== 7000) {
        throw new Error(data.message || i18n.t("error_load_profile"));
      }
      return data.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, i18n.t("error_load_profile")),
      );
    }
  },
  updateProfile: async (request: {
    fullName: string;
    phone: string;
  }): Promise<UserProfile> => {
    try {
      const res = await axiosClient.put<ApiResponse<UserProfile>>(
        USER_ENDPOINTS.PROFILE,
        request,
      );
      const data = res.data;
      if (data.code !== 7001) {
        throw new Error(
          data.message || i18n.t("error_update_profile"),
        );
      }
      return data.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, i18n.t("error_update_profile")),
      );
    }
  },

  getUsers: async (
    page: number,
    size: number,
  ): Promise<PaginationResponse<UserProfile>> => {
    try {
      const res = await axiosClient.get<ApiResponse<PaginationResponse<UserProfile>>>(
        USER_ENDPOINTS.ADMIN_USERS,
        {
          params: { page, size },
        },
      );
      const data = res.data;
      if (data.code !== 7002) {
        throw new Error(data.message || i18n.t("error_load_users"));
      }

      return data.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, i18n.t("error_load_users")),
      );
    }
  },

  toggleActive: async (id: UUID, isLock: boolean): Promise<void> => {
    try {
      if (isLock) {
        const res = await axiosClient.put<ApiResponse<null>>(
          USER_ENDPOINTS.ADMIN_USERS_LOCK(id),
        );
        const data = res.data;
        if (data.code !== 7003) {
          throw new Error(data.message || i18n.t("error_lock_user"));
        }
      } else {
        const res = await axiosClient.put<ApiResponse<null>>(
          USER_ENDPOINTS.ADMIN_USERS_UNLOCK(id),
        );
        const data = res.data;
        if (data.code !== 7004) {
          throw new Error(data.message || i18n.t("error_unlock_user"));
        }
      }
    } catch (error) {
      throw new Error(
        getErrorMessage(error, isLock ? i18n.t("error_lock_user") : i18n.t("error_unlock_user")),
      );
    }
  },
};
