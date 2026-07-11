import { ENV } from "../../../config/env";

export const AUTH_ENDPOINTS = {
  //  AUTH  — path thật có tiền tố /auth (đã xác nhận qua Postman: {{baseUrl}}/api/v1/auth/login)
  LOGIN: `${ENV.API_URL}/v1/auth/login`,
  REGISTER: `${ENV.API_URL}/v1/auth/register`,
  REFRESH_TOKEN: `${ENV.API_URL}/v1/auth/refresh-token`,
  LOGOUT: `${ENV.API_URL}/v1/auth/logout`,
  INTROSPECT: `${ENV.API_URL}/v1/auth/introspect`,
  CHANGE_PASSWORD: `${ENV.API_URL}/v1/auth/change-password`,
  VERIFY_EMAIL: `${ENV.API_URL}/v1/auth/verify-email`,
  RESEND_OTP: `${ENV.API_URL}/v1/auth/resend-otp`,
  FORGOT_PASSWORD: `${ENV.API_URL}/v1/auth/forgot-password`,
  RESET_PASSWORD: `${ENV.API_URL}/v1/auth/reset-password`,
} as const;
