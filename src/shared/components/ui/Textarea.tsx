import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      <textarea
        ref={ref}
        className={`w-full resize-none rounded-xl bg-transparent text-text placeholder-secondary outline-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
