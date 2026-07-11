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

export const followService = {
  follow: async (targetUserId: string): Promise<FollowResponse> => {
    try {
      const res = await axiosClient.post<ApiResponse<FollowResponse>>(
        FOLLOW_ENDPOINTS.FOLLOW(targetUserId),
      );
      const data = res.data;
      if (!data || data.code !== 3003 || !data.data) {
        throw new Error(getErrorMessage(data.message, "Failed to follow user"));
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to follow user"));
    }
  },

  unfollow: async (targetUserId: string): Promise<FollowResponse> => {
    try {
      const res = await axiosClient.delete<ApiResponse<FollowResponse>>(
        FOLLOW_ENDPOINTS.UNFOLLOW(targetUserId),
      );
      const data = res.data;
      if (!data || data.code !== 3004 || !data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to unfollow user"),
        );
      }
      return data.data;
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
