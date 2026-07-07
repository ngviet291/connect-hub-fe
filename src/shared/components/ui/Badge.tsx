import type { ReactNode } from 'react';

export const Badge = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-none text-white ${className}`}>
    {children}
  </span>
);
