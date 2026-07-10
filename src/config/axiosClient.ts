import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { store } from "../app/store";
import { logout, setTokens } from "../features/auth/store/authSlice";
import { authService } from "../features/auth/service/authService";
import { AUTH_ENDPOINTS } from "../features/auth/auth_endpoints";
import { ENV } from "./env";

const API_BASE_URL = ENV.API_URL;

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

const logoutAndRedirect = () => {
  store.dispatch(logout());
  window.location.href = "/login";
};

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    if (status !== 401) {
      return Promise.reject(error.response?.data || error);
    }

    if (originalRequest.url?.includes(AUTH_ENDPOINTS.REFRESH_TOKEN)) {
      logoutAndRedirect();
      return Promise.reject(error.response?.data || error);
    }

    if (originalRequest._retry) {
      logoutAndRedirect();
      return Promise.reject(error.response?.data || error);
    }

    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axiosClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = store.getState().auth.refreshToken;

    if (!refreshToken) {
      logoutAndRedirect();
      return Promise.reject(error.response?.data || error);
    }

    try {
      const tokenResponse = await authService.refreshToken({ refreshToken });

      store.dispatch(setTokens(tokenResponse));
      processQueue(null, tokenResponse.accessToken);isRefreshing = false; 

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${tokenResponse.accessToken}`;
      }

      return axiosClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      isRefreshing = false; 
      logoutAndRedirect();
      return Promise.reject(refreshError);
    }
  },
);

export default axiosClient;