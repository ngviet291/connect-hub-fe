import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store, type AppDispatch } from '../../../app/store';
import { notificationApi } from '../api/notificationApi';
import {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  markAsRead as markAsReadAction,
  markAllAsRead as markAllAsReadAction,
  selectNotifications,
  selectNotificationsLoading,
  selectNotificationsError,
  selectUnreadNotificationCount,
} from '../store/notificationSlice';

// Dùng chung 1 nguồn state (Redux store) để mọi nơi (sidebar, dropdown,
// trang Hoạt động, bottom nav) luôn đồng bộ khi đánh dấu đã đọc.
export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(selectNotifications);
  const isLoading = useSelector(selectNotificationsLoading);
  const error = useSelector(selectNotificationsError);
  const unreadCount = useSelector(selectUnreadNotificationCount);

  const refetch = useCallback(async () => {
    dispatch(fetchStart());
    try {
      const data = await notificationApi.getNotifications();
      dispatch(fetchSuccess(data));
    } catch {
      dispatch(fetchFailure());
    }
  }, [dispatch]);

  useEffect(() => {
    // Đọc trực tiếp từ store (không qua closure của lần render) để nhiều component
    // (sidebar, bottom nav, dropdown...) cùng mount vẫn chỉ fetch đúng 1 lần.
    if (!store.getState().notification.hasFetched) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsRead = useCallback(
    (id: string) => {
      dispatch(markAsReadAction(id));
      notificationApi.markAsRead(id);
    },
    [dispatch],
  );

  const markAllAsRead = useCallback(() => {
    dispatch(markAllAsReadAction());
    notificationApi.markAllAsRead();
  }, [dispatch]);

  return { notifications, isLoading, error, unreadCount, markAsRead, markAllAsRead, refetch };
};
