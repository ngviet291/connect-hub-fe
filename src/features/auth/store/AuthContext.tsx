import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useDispatch } from "react-redux";
import { authApi } from "../api/authApi";
import { setTokens, setUser, logout as logoutAction } from "./authSlice";
import { store, type AppDispatch } from "../../../app/store";
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "../types/auth.types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục user từ localStorage khi reload trang
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const saved = localStorage.getItem("user");
    if (token && saved) {
      try {
        setUserState(JSON.parse(saved));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    const res = await authApi.login(data);

    // Đồng bộ lên Redux (dùng bởi axiosClient interceptor + RoleGuard)
    dispatch(
      setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      }),
    );
    dispatch(
      setUser({
        email: res.user.email,
        role: res.user.roles[0], // lấy role đầu tiên (ROLE_USER / ROLE_ADMIN)
        fullName: res.user.fullName,
      }),
    );

    // Lưu user object đầy đủ cho AuthContext (avatar, bio...)
    localStorage.setItem("user", JSON.stringify(res.user));
    setUserState(res.user);
  };

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data);

    dispatch(
      setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      }),
    );
    dispatch(
      setUser({
        email: res.user.email,
        role: res.user.roles[0],
        fullName: res.user.fullName,
      }),
    );

    localStorage.setItem("user", JSON.stringify(res.user));
    setUserState(res.user);
  };

  const logout = () => {
    const { accessToken, refreshToken } = store.getState().auth;
    authApi
      .logout({
        accessToken: accessToken!,
        refreshToken: refreshToken!,
      })
      .finally(() => {
        dispatch(logoutAction());
        localStorage.removeItem("user");
        setUserState(null);
      });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
