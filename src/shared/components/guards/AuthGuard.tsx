import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { PageSpinner } from '../ui/Spinner';

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
