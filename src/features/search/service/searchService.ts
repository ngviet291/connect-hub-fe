import { getErrorMessage } from "@/constants/errorMessage";
import axiosClient from "@/config/axiosClient";
import type { ApiResponse, CursorResponse } from "@/shared/types/api.types";
import type { Post } from "@/features/post/types/post.types";
import type {
  HashtagSearchResponse,
  SearchPostResponse,
  UserSearchResponse,
} from "../types/search.types";
import { SEARCH_ENDPOINTS } from "../util/SearchEndpoints";

const normalizePost = (post: SearchPostResponse): Post => {
  const { author, ...rest } = post as SearchPostResponse & { author: unknown };
  return {
    ...rest,
    user: author,
  } as Post;
};

// xem đã follow chưa, nếu chưa thì set isFollowing = false
const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return value === "true" || value === "1" || value.toLowerCase() === "yes";
  }
  return false;
};

const normalizeUserSearchResponse = (
  user: Record<string, unknown>,
): UserSearchResponse => ({
  id: String(user.id),
  username: String(user.username ?? user.userName ?? user.user_name ?? ""),
  fullName: String(user.fullName ?? user.full_name ?? ""),
  avatarUrl: typeof user.avatarUrl === "string" ? user.avatarUrl : undefined,
  bio: typeof user.bio === "string" ? user.bio : undefined,
  isFollowing: normalizeBoolean(
    user.isFollowing ??
      user.is_following ??
      user.isFollowed ??
      user.is_followed ??
      user.followed ??
      user.followed_by_me ??
      user.followedByMe,
  ),
});

export const searchService = {
  searchUsers: async (
    keyword: string,
    cursor?: string,
    size = 20,
  ): Promise<CursorResponse<UserSearchResponse>> => {
    try {
      const res = await axiosClient.get<
        ApiResponse<CursorResponse<UserSearchResponse>>
      >(SEARCH_ENDPOINTS.USERS, {
        params: {
          keyword,
          size,
          ...(cursor ? { cursor } : {}),
        },
      });

      const data = res.data;
      if (!data || !data.data) {
        throw new Error(getErrorMessage(data?.message, "Failed to search users"));
      }

      return {
        ...data.data,
        content: data.data.content.map((user) =>
          normalizeUserSearchResponse(user as unknown as Record<string, unknown>),
        ),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to search users"));
    }
  },

  searchPosts: async (
    keyword: string,
    cursor?: string,
    size = 20,
  ): Promise<CursorResponse<Post>> => {
    try {
      const res = await axiosClient.get<
        ApiResponse<CursorResponse<SearchPostResponse>>
      >(SEARCH_ENDPOINTS.POSTS, {
        params: {
          keyword,
          size,
          ...(cursor ? { cursor } : {}),
        },
      });

      const data = res.data;
      if (!data || !data.data) {
        throw new Error(getErrorMessage(data?.message, "Failed to search posts"));
      }

      return {
        ...data.data,
        content: data.data.content.map(normalizePost),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to search posts"));
    }
  },

  searchHashtags: async (
    keyword: string,
    cursor?: string,
    size = 20,
  ): Promise<CursorResponse<HashtagSearchResponse>> => {
    try {
      const res = await axiosClient.get<
        ApiResponse<CursorResponse<HashtagSearchResponse>>
      >(SEARCH_ENDPOINTS.HASHTAGS, {
        params: {
          keyword,
          size,
          ...(cursor ? { cursor } : {}),
        },
      });

      const data = res.data;
      if (!data || !data.data) {
        throw new Error(getErrorMessage(data?.message, "Failed to search hashtags"));
      }

      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to search hashtags"));
    }
  },
};
