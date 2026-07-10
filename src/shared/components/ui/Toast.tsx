import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../app/store';
import { addToast, removeToast, selectToasts, type ToastItem } from '../../store/toastSlice';

// Hook để bắn toast từ bất kỳ component nào (dispatch vào Redux store).
export const useToast = () => {
  const dispatch = useDispatch<AppDispatch>();

  const showToast = useCallback(
    (message: string, type: ToastItem['type'] = 'info') => {
      const id = Date.now();
      dispatch(addToast({ id, message, type }));
      setTimeout(() => dispatch(removeToast(id)), 3000);
    },
    [dispatch],
  );

  return { showToast };
};

// Render 1 lần duy nhất ở App.tsx — đọc danh sách toast trực tiếp từ Redux store,
// không cần Provider bọc quanh cây component nữa.
export const ToastContainer = () => {
  const toasts = useSelector(selectToasts);

  return (
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
  );
};
