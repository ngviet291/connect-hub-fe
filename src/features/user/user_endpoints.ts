import { ENV } from "../../config/env";

export const USER_ENDPOINTS = {
  PROFILE: `${ENV.API_URL}/v1/users`,
  USER_BY_ID: (id: string) => `${ENV.API_URL}/v1/admin/users/${id}`,
  FOLLOWERS: `${ENV.API_URL}/v1/users/followers`,
  FOLLOWING: `${ENV.API_URL}/v1/users/following`,
  FOLLOWERS_BY_ID: (id: string) => `${ENV.API_URL}/v1/admin/users/${id}/followers`,
  FOLLOWING_BY_ID: (id: string) => `${ENV.API_URL}/v1/admin/users/${id}/following`,
  FOLLOW: (id: string) => `${ENV.API_URL}/v1/users/${id}/follow`,
  UNFOLLOW: (id: string) => `${ENV.API_URL}/v1/users/${id}/unfollow`,
  UPDATE_PROFILE: (id: string) => `${ENV.API_URL}/v1/users/${id}`,
  AVATAR: `${ENV.API_URL}/v1/users/avatar`,
  STATUS: `${ENV.API_URL}/v1/users/status`,
  STATS: `${ENV.API_URL}/v1/users/stats`,
  ADMIN_USERS: `${ENV.API_URL}/v1/admin/users/allusers`,
  ADMIN_USERS_LOCK: (id: string) => `${ENV.API_URL}/v1/users/${id}/lock`,
  ADMIN_USERS_UNLOCK: (id: string) => `${ENV.API_URL}/v1/users/${id}/unlock`,

} as const;