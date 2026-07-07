import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message = 'Đã có lỗi xảy ra. Vui lòng thử lại.', onRetry }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center animate-fade-in">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-2xl">⚠️</div>
    <p className="text-sm text-secondary">{message}</p>
    {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Thử lại</Button>}
  </div>
);
