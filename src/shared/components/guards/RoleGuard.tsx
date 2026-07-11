import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import type { UserRole } from '../../../features/user/types/user.types';

interface RoleGuardProps {
  children: ReactNode;
  /** Danh sách role được phép truy cập route này */
  allowedRoles: UserRole[];
}

/**
 * Bọc ngoài AuthGuard: chỉ cho qua nếu user đã đăng nhập VÀ có 1 trong các role được phép.
 * Nếu chưa đăng nhập -> điều hướng /login (giống AuthGuard).
 * Nếu đã đăng nhập nhưng không đủ quyền -> điều hướng /403.
 */
export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const isAllowed = user.roles?.some((role: UserRole) => allowedRoles.includes(role));
  if (!isAllowed) return <Navigate to="/403" replace />;

  return <>{children}</>;
};
