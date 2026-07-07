export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  code: string;
}
