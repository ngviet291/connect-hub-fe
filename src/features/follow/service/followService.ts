import { getErrorMessage } from "@/constants/errorMessage";
import axiosClient from "../../../config/axiosClient";
import type {
  ApiResponse,
  CursorResponse,
} from "../../../shared/types/api.types";
import type {
  FollowResponse,
  UserStats,
  UserSummaryResponse,
} from "../types/follow.types";
import { FOLLOW_ENDPOINTS } from "../util/FollowEndpoint";
import { USER_ENDPOINTS } from "../../user/util/UserEndpoints";

export const followService = {
  follow: async (targetUserId: string): Promise<FollowResponse> => {
    try {
      const res = await axiosClient.post<ApiResponse<FollowResponse | null>>(
        USER_ENDPOINTS.FOLLOW_USER(targetUserId),
      );
      const data = res.data;
      if (!data || ![200, 3003].includes(data.code)) {
        throw new Error(getErrorMessage(data?.message, "Failed to follow user"));
      }
      const result = data.data ?? { success: true };
      try {
        window.dispatchEvent(
          new CustomEvent("follow-changed", {
            detail: { userId: targetUserId, isFollowing: true },
          }),
        );
      } catch (e) {
        // ignore in non-browser environments
      }
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to follow user"));
    }
  },

  unfollow: async (targetUserId: string): Promise<FollowResponse> => {
    try {
      const res = await axiosClient.delete<ApiResponse<FollowResponse | null>>(
        USER_ENDPOINTS.UNFOLLOW_USER(targetUserId),
      );
      const data = res.data;
      if (!data || ![200, 3004].includes(data.code)) {
        throw new Error(
          getErrorMessage(data?.message, "Failed to unfollow user"),
        );
      }
      const result = data.data ?? { success: true };
      try {
        window.dispatchEvent(
          new CustomEvent("follow-changed", {
            detail: { userId: targetUserId, isFollowing: false },
          }),
        );
      } catch (e) {
        // ignore in non-browser environments
      }
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to unfollow user"));
    }
  },

  getFollowers: async (
    username: string,
    cursor?: string,
    size = 20,
  ): Promise<CursorResponse<UserSummaryResponse>> => {
    try {
      const res = await axiosClient.get<
        ApiResponse<CursorResponse<UserSummaryResponse>>
      >(FOLLOW_ENDPOINTS.FOLLOWERS(username), {
        params: { size, ...(cursor ? { cursor } : {}) },
      });
      const data = res.data;
      if (!data || data.code !== 200 || !data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to fetch followers"),
        );
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to fetch followers"));
    }
  },

  getFollowing: async (
    username: string,
    cursor?: string,
    size = 20,
  ): Promise<CursorResponse<UserSummaryResponse>> => {
    try {
      const res = await axiosClient.get<
        ApiResponse<CursorResponse<UserSummaryResponse>>
      >(FOLLOW_ENDPOINTS.FOLLOWING(username), {
        params: { size, ...(cursor ? { cursor } : {}) },
      });
      const data = res.data;
      if (!data || data.code !== 200 || !data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to fetch following"),
        );
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to fetch following"));
    }
  },

  getStats: async (userId: string): Promise<UserStats> => {
    try {
      const res = await axiosClient.get<ApiResponse<UserStats>>(
        FOLLOW_ENDPOINTS.USER_STATS(userId),
      );
      const data = res.data;
      if (!data || data.code !== 3007 || !data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to fetch user stats"),
        );
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to fetch user stats"));
    }
  },
};
