import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-secondary">{label}</label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={`w-full rounded-xl border bg-surface px-4 py-2.5 text-text placeholder-secondary outline-none transition-colors focus:border-primary ${leftIcon ? "pl-10" : ""} ${error ? "border-danger" : "border-border"} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  ),
);
Input.displayName = "Input";
