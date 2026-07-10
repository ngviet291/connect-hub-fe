import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type { AppNotification } from '../types/notification.types';

interface NotificationState {
  notifications: AppNotification[];
  isLoading: boolean;
  error: boolean;
  hasFetched: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  isLoading: true,
  error: false,
  hasFetched: false,
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    fetchStart(state) {
      state.isLoading = true;
      state.error = false;
      state.hasFetched = true;
    },
    fetchSuccess(state, { payload }: PayloadAction<AppNotification[]>) {
      state.notifications = payload;
      state.isLoading = false;
    },
    fetchFailure(state) {
      state.error = true;
      state.isLoading = false;
    },
    markAsRead(state, { payload: id }: PayloadAction<string>) {
      const n = state.notifications.find((x) => x.id === id);
      if (n) n.isRead = true;
    },
    markAllAsRead(state) {
      state.notifications.forEach((n) => { n.isRead = true; });
    },
  },
});

export const { fetchStart, fetchSuccess, fetchFailure, markAsRead, markAllAsRead } =
  notificationSlice.actions;

export const selectNotifications = (s: RootState) => s.notification.notifications;
export const selectNotificationsLoading = (s: RootState) => s.notification.isLoading;
export const selectNotificationsError = (s: RootState) => s.notification.error;
export const selectUnreadNotificationCount = (s: RootState) =>
  s.notification.notifications.filter((n) => !n.isRead).length;

export default notificationSlice.reducer;
