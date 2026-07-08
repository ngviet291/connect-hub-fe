import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/store/AuthContext';
import type { UserRole } from '../../../features/user/types/user.types';
import { PageSpinner } from '../ui/Spinner';

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
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  const isAllowed = user.roles?.some((role) => allowedRoles.includes(role));
  if (!isAllowed) return <Navigate to="/403" replace />;

  return <>{children}</>;
};
