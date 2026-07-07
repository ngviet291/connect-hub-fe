import { MOCK_NOTIFICATIONS } from '../../../mocks/mockData';
import type { AppNotification } from '../types/notification.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
let store: AppNotification[] = [...MOCK_NOTIFICATIONS];

export const notificationApi = {
  getNotifications: async (): Promise<AppNotification[]> => {
    await delay();
    // TODO: thay bằng api.get('/notifications').then(r => r.data)
    return [...store];
  },

  markAsRead: async (id: string) => {
    await delay(150);
    // TODO: api.patch(`/notifications/${id}/read`)
    store = store.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  },

  markAllAsRead: async () => {
    await delay(200);
    // TODO: api.patch('/notifications/read-all')
    store = store.map((n) => ({ ...n, isRead: true }));
  },
};
