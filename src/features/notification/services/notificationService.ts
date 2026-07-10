import type { ApiResponse, CursorResponse } from "@/shared/types/api.types";
import type {
  NotificationResponse,
  NotificationUnreadResponse,
} from "../types/notification.types";
import { getErrorMessage } from "@/constants/errorMessage";
import axiosClient from "@/config/axiosClient";
import { NOTIFICATION_ENDPOINTS } from "../util/NotificationEndpoint";

export const notificationService = {
  getNotifications: async (
    cursor?: string,
    size = 20,
  ): Promise<CursorResponse<NotificationResponse>> => {
    try {
      const res = await axiosClient.get<
        ApiResponse<CursorResponse<NotificationResponse>>
      >(NOTIFICATION_ENDPOINTS.GET_NOTIFICATIONS, {
        params: {
          size,
          ...(cursor && { cursor }),
        },
      });

      const data = res.data;

      if (!data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to fetch notifications"),
        );
      }

      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to fetch notifications"));
    }
  },
  markAsRead: async (id: string) => {
    try {
      const res = await axiosClient.patch<ApiResponse<void>>(
        NOTIFICATION_ENDPOINTS.MARK_AS_READ(id),
      );

      if (!res.data || res.data.code !== 8000) {
        throw new Error(
          getErrorMessage(
            res.data.message,
            "Failed to mark notification as read",
          ),
        );
      }
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Failed to mark notification as read"),
      );
    }
  },

  markAllAsRead: async () => {
    try {
      const res = await axiosClient.patch<ApiResponse<void>>(
        NOTIFICATION_ENDPOINTS.MARK_ALL_AS_READ,
      );

      if (!res.data || res.data.code !== 8001) {
        throw new Error(
          getErrorMessage(
            res.data.message,
            "Failed to mark all notifications as read",
          ),
        );
      }
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Failed to mark all notifications as read"),
      );
    }
  },

  countUnread: async (): Promise<NotificationUnreadResponse> => {
    try {
      const res = await axiosClient.get<
        ApiResponse<NotificationUnreadResponse>
      >(NOTIFICATION_ENDPOINTS.COUNT_UNREAD);

      if (!res.data || res.data.code !== 8002 || !res.data.data) {
        throw new Error(
          getErrorMessage(
            res.data.message,
            "Failed to count unread notifications",
          ),
        );
      }

      return res.data.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Failed to count unread notifications"),
      );
    }
  },
};
