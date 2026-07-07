import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../api/authApi';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types/auth.types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const saved = localStorage.getItem('user');
    if (token && saved) setUser(JSON.parse(saved));
    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    const res = await authApi.login(data);
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    authApi.logout().finally(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
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
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
