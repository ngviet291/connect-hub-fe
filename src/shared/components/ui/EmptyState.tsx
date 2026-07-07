import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center animate-fade-in">
    {icon && <div className="mb-2 text-secondary">{icon}</div>}
    <p className="font-semibold text-text">{title}</p>
    {description && <p className="max-w-xs text-sm text-secondary">{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);
