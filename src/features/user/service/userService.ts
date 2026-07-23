import axiosClient from "../../../config/axiosClient";
import { USER_ENDPOINTS } from "../util/UserEndpoints";
import { getErrorMessage } from "../../../constants/errorMessage";
import i18n from "../../../i18n/i18n";
import type { ApiResponse, PaginationResponse } from "@/shared/types/api.types";
import type { UUID } from "../../../shared/types/common.types";
import type { UpdateProfileRequest, UserProfile } from "../types/user.types";
import type { UserSummaryResponse } from "../../follow/types/follow.types";

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
      throw new Error(getErrorMessage(error, i18n.t("error_load_profile")));
    }
  },

  updateProfile: async (
    request: UpdateProfileRequest,
  ): Promise<UserProfile> => {
    try {
      const res = await axiosClient.put<ApiResponse<UserProfile>>(
        USER_ENDPOINTS.PROFILE,
        request,
      );
      const data = res.data;
      if (data.code !== 3005 ) {
        throw new Error(data.message || i18n.t("error_update_profile"));
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_update_profile")));
    }
  },

  uploadAvatar: async (file: File): Promise<UserProfile> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosClient.put<ApiResponse<UserProfile>>(
        USER_ENDPOINTS.AVATAR,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const data = res.data;
      if (data.code !== 7001 && data.code !== 7000) {
        throw new Error(data.message || i18n.t("error_update_profile"));
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_update_profile")));
    }
  },

  getUsers: async (
    page: number,
    size: number,
  ): Promise<PaginationResponse<UserProfile>> => {
    try {
      const res = await axiosClient.get<
        ApiResponse<PaginationResponse<UserProfile>>
      >(USER_ENDPOINTS.ADMIN_USERS, {
        params: { page, size },
      });
      const data = res.data;
      if (data.code !== 7002) {
        throw new Error(data.message || i18n.t("error_load_users"));
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_load_users")));
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
        getErrorMessage(
          error,
          isLock ? i18n.t("error_lock_user") : i18n.t("error_unlock_user"),
        ),
      );
    }
  },

  blockUser: async (id: UUID): Promise<void> => {
    try {
      await axiosClient.post<ApiResponse<null>>(USER_ENDPOINTS.USERS_BLOCK(id));
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_block_user")));
    }
  },

  unblockUser: async (id: UUID): Promise<void> => {
    try {
      await axiosClient.delete<ApiResponse<null>>(USER_ENDPOINTS.USERS_UNBLOCK(id));
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_unblock_user")));
    }
  },

  getBlockStatus: async (id: UUID): Promise<boolean> => {
    try {
      const res = await axiosClient.get<ApiResponse<{ isBlocked: boolean }>>(
        USER_ENDPOINTS.USERS_BLOCK_STATUS(id),
      );
      const data = res.data;
      if (!data) return false;

      // If API returns boolean directly in data
      if (typeof data.data === 'boolean') return data.data;

      const obj = data.data || {};

      // Common possible keys for block status
      const possibleKeys = [
        'isBlocked',
        'blocked',
        'isBlocking',
        'blockedByMe',
        'blockedByCurrentUser',
        'isBlockedByMe',
        'blocking',
        'blockedBy',
      ];

      for (const key of possibleKeys) {
        if (key in (obj as any)) {
          return Boolean((obj as any)[key]);
        }
      }

      // Fallback: look for any boolean value inside the response object
      const vals = Object.values(obj);
      for (const v of vals) {
        if (typeof v === 'boolean') return v;
      }

      return false;
    } catch (error) {
      return false;
    }
  },

  getBlockedUsers: async (): Promise<UserSummaryResponse[]> => {
    try {
      const res = await axiosClient.get<ApiResponse<{ content: UserSummaryResponse[] }>>(
        USER_ENDPOINTS.USERS_BLOCKED,
      );
      const data = res.data;
      if (!data || !data.data) {
        return [];
      }
      return data.data.content ?? [];
    } catch (error) {
      return [];
    }
  },

  getUserByUsername: async (username: string): Promise<UserProfile> => {
    try {
      const res = await axiosClient.get<ApiResponse<UserProfile>>(
        USER_ENDPOINTS.USER_BY_USERNAME(username),
      );
      const data = res.data;
      if (data.code !== 3000) {
        throw new Error(data.message || i18n.t("error_load_user"));
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_load_user")));
    }
  },
  getUserById: async (id: string): Promise<UserProfile> => {
    try {
      const res = await axiosClient.get<ApiResponse<UserProfile>>(
        USER_ENDPOINTS.USER_BY_ID(id),
      );
      const data = res.data;
      if (data.code !== 3000) {
        throw new Error(data.message || i18n.t("error_load_user"));
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_load_user")));
    }
  },
};
