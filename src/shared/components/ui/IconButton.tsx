import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' };

export const IconButton = ({ icon, size = 'md', active, className = '', ...props }: IconButtonProps) => (
  <button
    className={`flex cursor-pointer items-center justify-center rounded-full text-text transition-colors duration-150 hover:bg-surface-hover active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 ${sizes[size]} ${active ? 'text-primary' : ''} ${className}`}
    {...props}
  >
    {icon}
  </button>
);
