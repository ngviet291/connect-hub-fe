import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig, AxiosError } from "axios";
import axiosClient from "@/config/axiosClient";
import { getErrorMessage } from "@/constants/errorMessage";
import type { ApiResponse, CursorResponse } from "@/shared/types/api.types";
import type {
  NotificationResponse,
  NotificationUnreadResponse,
} from "../types/notification.types";
import { NOTIFICATION_ENDPOINTS } from "../util/NotificationEndpoint";

// ---- base query dùng axiosClient (giữ nguyên interceptor auth/refresh token đang có) ----
const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: unknown;
      params?: unknown;
    },
    unknown,
    unknown
  > =>
  async ({ url, method = "get", data, params }) => {
    try {
      const result = await axiosClient.request({ url, method, data, params });
      return { data: result.data };
    } catch (error) {
      return {
        error: {
          status: (error as AxiosError).response?.status,
          data: getErrorMessage(error, "Request failed"),
        },
      };
    }
  };

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Notification", "UnreadCount"],
  endpoints: (builder) => ({
    getNotifications: builder.query<
      CursorResponse<NotificationResponse>,
      { cursor?: string; size?: number } | void
    >({
      query: (arg) => ({
        url: NOTIFICATION_ENDPOINTS.GET_NOTIFICATIONS,
        params: {
          size: arg?.size ?? 20,
          ...(arg?.cursor && { cursor: arg.cursor }),
        },
      }),
      transformResponse: (
        res: ApiResponse<CursorResponse<NotificationResponse>>,
      ) => {
        if (!res.data) {
          throw new Error(
            getErrorMessage(res.message, "Failed to fetch notifications"),
          );
        }
        return res.data;
      },
      // Bỏ qua arg khi tính cache key -> mọi trang (cursor khác nhau) dồn vào CÙNG 1 cache entry
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (cache, newPage, { arg }) => {
        if (!arg || !arg.cursor) {
          // load lần đầu / refetch -> thay toàn bộ
          return newPage;
        }
        cache.content.push(...newPage.content);
        cache.nextCursor = newPage.nextCursor;
        cache.hasNext = newPage.hasNext;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ["Notification"],
    }),

    countUnread: builder.query<number, void>({
      query: () => ({ url: NOTIFICATION_ENDPOINTS.COUNT_UNREAD }),
      transformResponse: (res: ApiResponse<NotificationUnreadResponse>) => {
        if (!res.data) {
          throw new Error(
            getErrorMessage(res.message, "Failed to count unread"),
          );
        }
        return res.data.unreadCount;
      },
      providesTags: ["UnreadCount"],
    }),

    markAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: NOTIFICATION_ENDPOINTS.MARK_AS_READ(id),
        method: "patch",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchList = dispatch(
          notificationApi.util.updateQueryData(
            "getNotifications",
            undefined,
            (draft) => {
              const n = draft.content.find((n) => n.id === id);
              if (n && !n.read) n.read = true;
            },
          ),
        );
        const patchCount = dispatch(
          notificationApi.util.updateQueryData("countUnread", undefined, (c) =>
            Math.max(0, c - 1),
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchList.undo();
          patchCount.undo();
        }
      },
    }),

    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: NOTIFICATION_ENDPOINTS.MARK_ALL_AS_READ,
        method: "patch",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchList = dispatch(
          notificationApi.util.updateQueryData(
            "getNotifications",
            undefined,
            (draft) => {
              draft.content.forEach((n) => (n.read = true));
            },
          ),
        );
        const patchCount = dispatch(
          notificationApi.util.updateQueryData(
            "countUnread",
            undefined,
            () => 0,
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchList.undo();
          patchCount.undo();
        }
      },
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery, // dùng cho loadMore (truyền { cursor })
  useCountUnreadQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
