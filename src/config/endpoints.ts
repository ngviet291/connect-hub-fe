import { ENV } from "./env";

export const API_ENDPOINTS = {
  //  AUTH
  LOGIN: `${ENV.API_URL}/v1/auth/login`,
  REGISTER: `${ENV.API_URL}/v1/auth/register`,
  REFRESH_TOKEN: `${ENV.API_URL}/v1/auth/refresh`,
  LOGOUT: `${ENV.API_URL}/v1/auth/logout`,
  VERIFY_EMAIL: `${ENV.API_URL}/v1/auth/verify-email`,
  RESEND_OTP: `${ENV.API_URL}/v1/auth/resend-otp`,
  FORGOT_PASSWORD: `${ENV.API_URL}/v1/auth/forgot-password`,
  RESET_PASSWORD: `${ENV.API_URL}/v1/auth/reset-password`,

  //user
  PROFILE: `${ENV.API_URL}/v1/users/me`,
  USERS: `${ENV.API_URL}/v1/users`,
  USER_BY_ID: (id: string) => `${ENV.API_URL}/v1/users/${id}`,

  //admin
  ADMIN_USERS: `${ENV.API_URL}/v1/admin/users`,
  ADMIN_USERS_LOCK: (id: string) => `${ENV.API_URL}/v1/admin/users/${id}/lock`,
  ADMIN_USERS_UNLOCK: (id: string) =>
    `${ENV.API_URL}/v1/admin/users/${id}/unlock`,

  // POST
  POSTS: `${ENV.API_URL}/v1/posts`,
  POST_BY_ID: (id: string) => `${ENV.API_URL}/v1/posts/${id}`,
  FEED: `${ENV.API_URL}/v1/posts/feed`,

  // SEARCH
  SEARCH_USERS: `${ENV.API_URL}/v1/search/users`,
  SEARCH_POSTS: `${ENV.API_URL}/v1/search/posts`,
  SEARCH_HASHTAGS: `${ENV.API_URL}/v1/search/hashtags`,

  // NOTIFICATION
  NOTIFICATIONS: `${ENV.API_URL}/v1/notifications`,
} as const;
