import { ENV } from "@/config/env";

export const USER_ENDPOINTS = {
  PROFILE: `${ENV.API_URL}/v1/users`,
  USER_BY_ID: (id: string) => `${ENV.API_URL}/v1/admin/users/${id}`,
  FOLLOWERS_BY_ID: (id: string) =>
    `${ENV.API_URL}/v1/admin/users/${id}/followers`,
  FOLLOWING_BY_ID: (id: string) =>
    `${ENV.API_URL}/v1/admin/users/${id}/following`,
  UPDATE_PROFILE: (id: string) => `${ENV.API_URL}/v1/users/${id}`,
  USER_BY_USERNAME: (username: string) => `${ENV.API_URL}/v1/users/${username}`,
  SEARCH: `${ENV.API_URL}/v1/users/search`,
  AVATAR_UPLOAD: `${ENV.API_URL}/v1/users/avatar/upload`,
  AVATAR_DELETE: `${ENV.API_URL}/v1/users/avatar/delete`,
  AVATAR: `${ENV.API_URL}/v1/users/avatar`,
  STATUS: `${ENV.API_URL}/v1/users/status`,
  STATS: `${ENV.API_URL}/v1/users/stats`,
  ADMIN_USERS: `${ENV.API_URL}/v1/admin/users/allusers`,
  ADMIN_USERS_LOCK: (id: string) => `${ENV.API_URL}/v1/users/${id}/lock`,
  ADMIN_USERS_UNLOCK: (id: string) => `${ENV.API_URL}/v1/users/${id}/unlock`,
} as const;
