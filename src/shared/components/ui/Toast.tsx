import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastItem['type']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 left-1/2 z-[200] flex -translate-x-1/2 flex-col gap-2 sm:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text shadow-xl ${
              t.type === 'error' ? 'border-danger/40 text-danger' : ''
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
