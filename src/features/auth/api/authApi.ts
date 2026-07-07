import { MOCK_USER } from '../../../mocks/mockData';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '../types/auth.types';

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export const authApi = {
  login: async (_data: LoginRequest): Promise<AuthResponse> => {
    await delay();
    // TODO: thay bằng api.post('/auth/login', _data).then(r => r.data)
    // _data.emailOrUsername chấp nhận cả email lẫn username, backend tự phân biệt
    return { accessToken: 'mock-token-xxx', user: MOCK_USER };
  },

  register: async (_data: RegisterRequest): Promise<AuthResponse> => {
    await delay();
    // TODO: thay bằng api.post('/auth/register', _data).then(r => r.data)
    return { accessToken: 'mock-token-xxx', user: { ...MOCK_USER, ..._data, id: MOCK_USER.id } };
  },

  logout: async () => {
    await delay(200);
    // TODO: thay bằng api.post('/auth/logout')
  },

  forgotPassword: async (_data: ForgotPasswordRequest): Promise<{ sent: boolean }> => {
    await delay();
    // TODO: thay bằng api.post('/auth/forgot-password', _data).then(r => r.data)
    return { sent: true };
  },

  resetPassword: async (_data: ResetPasswordRequest): Promise<{ success: boolean }> => {
    await delay();
    // TODO: thay bằng api.post('/auth/reset-password', _data).then(r => r.data)
    return { success: true };
  },

  verifyEmail: async (_data: VerifyEmailRequest): Promise<{ verified: boolean }> => {
    await delay();
    // TODO: thay bằng api.post('/auth/verify-email', _data).then(r => r.data)
    return { verified: _data.code.length === 6 };
  },

  resendVerification: async (): Promise<{ sent: boolean }> => {
    await delay(400);
    // TODO: thay bằng api.post('/auth/resend-verification')
    return { sent: true };
  },
};
