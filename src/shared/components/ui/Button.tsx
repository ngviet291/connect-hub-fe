import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-primary hover:bg-primary-hover text-white',
  ghost: 'hover:bg-surface-hover text-text',
  outline: 'border border-border hover:border-primary text-text bg-transparent',
  danger: 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30',
};
const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading,
  fullWidth,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) => (
  <button
    disabled={disabled || loading}
    className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    {...props}
  >
    {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
    {children}
  </button>
);
