export const NOTIFICATION_ENDPOINTS = {
  GET_NOTIFICATIONS: "/v1/notifications",
  MARK_AS_READ: (notificationId: string) =>
    `/v1/notifications/${notificationId}/read`,
  MARK_ALL_AS_READ: "/v1/notifications/read-all",
  COUNT_UNREAD: "/v1/notifications/unread-count",
};
