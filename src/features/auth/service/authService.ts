import { store } from "../../../app/store";
import {
  setTokens,
  setUser,
  logout as logoutAction,
  setCurrentUser,
} from "../store/authSlice";
import { authApi, AUTH_CODE } from "../api/authApi";
import type { TokenPair } from "../api/authApi";
import { getErrorMessage } from "../../../constants/errorMessage";
import i18n from "../../../i18n/i18n";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "../types/auth.types";

const saveAuth = (user: AuthResponse) => {
  store.dispatch(
    setTokens({
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    }),
  );
  store.dispatch(
    setUser({
      email: user.user.email,
      role: user.user.roles[0],
      fullName: user.user.fullName,
    }),
  );
  store.dispatch(setCurrentUser(user.user));
};

export const authService = {
  login: async (data: LoginRequest) => {
    try {
      const res = await authApi.login(data);
      if (res.data.code !== AUTH_CODE.LOGIN_SUCCESS) {
        throw new Error(res.data.message || i18n.t("error_login_failed"));
      }
      saveAuth(res.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_login_failed")));
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      const res = await authApi.register(data);
      if (res.data.code !== AUTH_CODE.REGISTER_SUCCESS) {
        throw new Error(res.data.message || i18n.t("error_register_failed"));
      }
      saveAuth(res.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_register_failed")));
    }
  },

  logout: async () => {
    const { accessToken, refreshToken } = store.getState().auth;
    try {
      const res = await authApi.logout({
        accessToken: accessToken!,
        refreshToken: refreshToken!,
      });
      if (res.data.code !== AUTH_CODE.LOGOUT_SUCCESS) {
        throw new Error(res.data.message || i18n.t("error_logout_failed"));
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_logout_failed")));
    } finally {
      store.dispatch(logoutAction());
    }
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    try {
      const res = await authApi.forgotPassword(data);
      return res.data.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, i18n.t("error_forgot_password_failed")),
      );
    }
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    try {
      const res = await authApi.resetPassword(data);
      return res.data.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, i18n.t("error_reset_password_failed")),
      );
    }
  },

  verifyEmail: async (data: VerifyEmailRequest) => {
    try {
      const res = await authApi.verifyEmail(data);
      return res.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("verify_error")));
    }
  },

  resendVerification: async () => {
    try {
      const res = await authApi.resendVerification();
      return res.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, i18n.t("error_resend_failed")));
    }
  },

  refreshToken: async (data: { refreshToken: string }): Promise<TokenPair> => {
    const res = await authApi.refreshToken(data);
    if (res.data.code !== AUTH_CODE.TOKEN_REFRESH_SUCCESS) {
      throw new Error(res.data.message);
    }
    return res.data.data;
  },
};
