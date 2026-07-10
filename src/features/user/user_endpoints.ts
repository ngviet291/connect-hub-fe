import { ENV } from "../../config/env";

export const USER_ENDPOINTS = {

  //user
  PROFILE: `${ENV.API_URL}/users/me`,
  USERS: `${ENV.API_URL}/users`,
  USER_BY_ID: (id: string) => `${ENV.API_URL}/users/${id}`,

    //admin  
  ADMIN_USERS: `${ENV.API_URL}/admin/users`,
  ADMIN_USERS_LOCK: (id: string) =>
    `${ENV.API_URL}/admin/users/${id}/lock`,
  ADMIN_USERS_UNLOCK: (id: string) =>
    `${ENV.API_URL}/admin/users/${id}/unlock`,

} as const;