import type { ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest } from '../types/auth.types';

type Errors<T> = Partial<Record<keyof T, string>>;

const isEmpty = (v: string) => !v?.trim();

export const validateLogin = (data: LoginRequest): Errors<LoginRequest> => {
  const e: Errors<LoginRequest> = {};
  if (isEmpty(data.username))  e.username = 'Tên đăng nhập không được để trống';
  if (isEmpty(data.password))  e.password = 'Mật khẩu không được để trống';
  return e;
};

export const validateRegister = (data: RegisterRequest & { confirmPassword?: string }): Errors<RegisterRequest & { confirmPassword?: string }> => {
  const e: Errors<RegisterRequest & { confirmPassword?: string }> = {};
  if (isEmpty(data.username))             e.username = 'Tên đăng nhập không được để trống';
  else if (data.username.length < 3)      e.username = 'Tên đăng nhập ít nhất 3 ký tự';
  else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) e.username = 'Chỉ được dùng chữ, số và dấu _';

  if (isEmpty(data.email))                e.email = 'Email không được để trống';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Email không hợp lệ';

  if (isEmpty(data.password))             e.password = 'Mật khẩu không được để trống';
  else if (data.password.length < 8)      e.password = 'Mật khẩu ít nhất 8 ký tự';

  if (data.confirmPassword !== data.password) e.confirmPassword = 'Mật khẩu xác nhận không khớp';

  return e;
};

export const validateForgotPassword = (data: ForgotPasswordRequest): Errors<ForgotPasswordRequest> => {
  const e: Errors<ForgotPasswordRequest> = {};
  if (isEmpty(data.email))                e.email = 'Email không được để trống';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Email không hợp lệ';
  return e;
};

export const validateResetPassword = (data: ResetPasswordRequest & { confirmPassword?: string }): Errors<ResetPasswordRequest & { confirmPassword?: string }> => {
  const e: Errors<ResetPasswordRequest & { confirmPassword?: string }> = {};
  if (isEmpty(data.newPassword))          e.newPassword = 'Mật khẩu không được để trống';
  else if (data.newPassword.length < 8)   e.newPassword = 'Mật khẩu ít nhất 8 ký tự';
  if (data.confirmPassword !== data.newPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp';
  return e;
};

/** Trả về true nếu không có lỗi */
export const isValid = (errors: Record<string, string | undefined>) =>
  Object.values(errors).every((v) => !v);
