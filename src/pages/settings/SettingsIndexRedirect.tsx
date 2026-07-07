import { Navigate } from 'react-router-dom';

export const SettingsIndexRedirect = () => {
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  if (isDesktop) return <Navigate to="account" replace />;
  return null;
};
