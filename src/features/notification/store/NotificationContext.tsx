import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { notificationApi } from '../api/notificationApi';
import type { AppNotification } from '../types/notification.types';

interface NotificationContextValue {
  notifications: AppNotification[];
  isLoading: boolean;
  error: boolean;
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      setNotifications(await notificationApi.getNotifications());
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    notificationApi.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    notificationApi.markAllAsRead();
  }, []);

  const value = useMemo(
    () => ({ notifications, isLoading, error, unreadCount, markAsRead, markAllAsRead, refetch: fetchAll }),
    [notifications, isLoading, error, unreadCount, markAsRead, markAllAsRead, fetchAll]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
