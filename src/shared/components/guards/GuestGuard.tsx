import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/store/AuthContext';
import { PageSpinner } from '../ui/Spinner';

export const GuestGuard = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageSpinner />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};
