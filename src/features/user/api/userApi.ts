import axiosClient from '../../../config/axiosClient';
import { getErrorMessage } from '../../../constants/errorMessage';
import i18n from '../../../i18n/i18n';
import { store } from '../../../app/store';
import { searchApi } from '../../search/api/SearchApi';
import { USER_ENDPOINTS } from '../user_endpoints';
import type { ApiResponse, CursorResponse } from '../../../shared/types/api.types';
import type { UpdateProfileRequest, UserProfile } from '../types/user.types';

const unwrap = <T,>(payload: ApiResponse<T> | T): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

const unwrapUsers = (payload: ApiResponse<CursorResponse<UserProfile>> | CursorResponse<UserProfile>): UserProfile[] => {
  const data = unwrap(payload);
  if (Array.isArray(data)) {
    return data;
  }
  return data?.content ?? [];
};

const getCurrentUser = () => store.getState().auth.currentUser;

export const userApi = {
  getProfile: async (username: string): Promise<UserProfile> => {
    const normalizedUsername = username.trim();
    const currentUser = getCurrentUser();

    if (currentUser?.username === normalizedUsername) {
      try {
        const res = await axiosClient.get<ApiResponse<UserProfile> | UserProfile>(USER_ENDPOINTS.PROFILE);
        return unwrap(res.data);
      } catch (error) {
        throw new Error(getErrorMessage(error, i18n.t('error_load_profile')));
      }
    }

    try {
      const users = await searchApi.getAllUsers(100);
      const found = users.find((user) => user.username === normalizedUsername);
      if (found) {
        return found;
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t('error_load_profile')));
    }

    throw new Error(i18n.t('error_load_profile'));
  },

  updateProfile: async (_username: string, data: UpdateProfileRequest): Promise<UserProfile> => {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
      throw new Error(i18n.t('error_update_profile'));
    }

    try {
      const res = await axiosClient.put<ApiResponse<UserProfile> | UserProfile>(
        USER_ENDPOINTS.UPDATE_PROFILE(currentUser.id),
        data,
      );
      return unwrap(res.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t('error_update_profile')));
    }
  },

  follow: async (userId: string) => {
    try {
      await axiosClient.post(USER_ENDPOINTS.FOLLOW(userId));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Không thể theo dõi người dùng'));
    }
  },

  unfollow: async (userId: string) => {
    try {
      await axiosClient.delete(USER_ENDPOINTS.UNFOLLOW(userId));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Không thể bỏ theo dõi người dùng'));
    }
  },

  getFollowers: async (username: string): Promise<UserProfile[]> => {
    const currentUser = getCurrentUser();
    try {
      if (currentUser?.username === username) {
        const res = await axiosClient.get<ApiResponse<CursorResponse<UserProfile>> | CursorResponse<UserProfile>>(
          USER_ENDPOINTS.FOLLOWERS,
        );
        return unwrapUsers(res.data);
      }

      const users = await searchApi.getAllUsers(100);
      const target = users.find((user) => user.username === username);
      if (!target?.id) {
        return [];
      }

      const res = await axiosClient.get<ApiResponse<CursorResponse<UserProfile>> | CursorResponse<UserProfile>>(
        USER_ENDPOINTS.FOLLOWERS_BY_ID(target.id),
        { params: { size: 100 } },
      );
      return unwrapUsers(res.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t('error_load_users')));
    }
  },

  getFollowing: async (username: string): Promise<UserProfile[]> => {
    const currentUser = getCurrentUser();
    try {
      if (currentUser?.username === username) {
        const res = await axiosClient.get<ApiResponse<CursorResponse<UserProfile>> | CursorResponse<UserProfile>>(
          USER_ENDPOINTS.FOLLOWING,
        );
        return unwrapUsers(res.data);
      }

      const users = await searchApi.getAllUsers(100);
      const target = users.find((user) => user.username === username);
      if (!target?.id) {
        return [];
      }

      const res = await axiosClient.get<ApiResponse<CursorResponse<UserProfile>> | CursorResponse<UserProfile>>(
        USER_ENDPOINTS.FOLLOWING_BY_ID(target.id),
        { params: { size: 100 } },
      );
      return unwrapUsers(res.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t('error_load_users')));
    }
  },

  searchUsers: async (query: string): Promise<UserProfile[]> => {
    const response = await searchApi.searchUsers(query);
    return response.content;
  },

  getSuggested: async (): Promise<UserProfile[]> => {
    try {
      const users = await searchApi.getAllUsers(20);
      return users.filter((u) => !u.isFollowing).slice(0, 3);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Không thể tải gợi ý người dùng'));
    }
  },
};
