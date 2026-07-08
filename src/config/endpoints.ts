import { ENV } from "./env";

export const API_ENDPOINTS = {
  //  AUTH 
  LOGIN: `${ENV.API_URL}/auth/login`,
  REGISTER: `${ENV.API_URL}/auth/register`,
  REFRESH_TOKEN: `${ENV.API_URL}/auth/refresh`,
  LOGOUT: `${ENV.API_URL}/auth/logout`,
  VERIFY_EMAIL: `${ENV.API_URL}/auth/verify-email`,
  RESEND_OTP: `${ENV.API_URL}/auth/resend-otp`,
  FORGOT_PASSWORD: `${ENV.API_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${ENV.API_URL}/auth/reset-password`,

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

  // POST
  POSTS: `${ENV.API_URL}/posts`,
  POST_BY_ID: (id: string) => `${ENV.API_URL}/posts/${id}`,
  FEED: `${ENV.API_URL}/posts/feed`,

  // SEARCH
  SEARCH_USERS: `${ENV.API_URL}/search/users`,
  SEARCH_POSTS: `${ENV.API_URL}/search/posts`,
  SEARCH_HASHTAGS: `${ENV.API_URL}/search/hashtags`,

  // NOTIFICATION
  NOTIFICATIONS: `${ENV.API_URL}/notifications`,
} as const;