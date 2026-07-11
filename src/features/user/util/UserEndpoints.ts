import { ENV } from "../../../config/env";

export const USER_ENDPOINTS = {
  //user
  PROFILE: `${ENV.API_URL}/v1/users/me`,
  USERS: `${ENV.API_URL}/v1/users`,
  USER_BY_ID: (id: string) => `${ENV.API_URL}/v1/users/${id}`,
  USER_BY_USERNAME: (username: string) =>
    `${ENV.API_URL}/v1/users/username/${username}`,
  //admin
  ADMIN_USERS: `${ENV.API_URL}/v1/admin/users`,
  ADMIN_USERS_LOCK: (id: string) => `${ENV.API_URL}/v1/admin/users/${id}/lock`,
  ADMIN_USERS_UNLOCK: (id: string) =>
    `${ENV.API_URL}/v1/admin/users/${id}/unlock`,
} as const;
