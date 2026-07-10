import { useCallback } from "react";
import {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useCountUnreadQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../api/notificationApi";
import { useNotificationsRealtime } from "./useNotificationsRealtime";

/**
 * TRƯỚC ĐÂY: hook này tự quản lý state bằng 1 Redux slice riêng (notificationSlice)
 * và tự mở 1 WS subscription riêng tới "/user/queue/notifications", hoàn toàn tách biệt
 * với notificationApi (RTK Query) mà NotificationDropdown đang dùng. Hậu quả:
 *  1) 2 "nguồn sự thật" không đồng bộ -> mark-as-read/mark-all-read ở Dropdown không
 *     phản ánh sang NotificationsPage/Sidebar/BottomNav (và ngược lại).
 *  2) stompClient chỉ giữ ĐÚNG 1 handler cho mỗi destination, nên khi 2 hook cùng
 *     subscribe "/user/queue/notifications", handler nào subscribe sau sẽ "thắng" còn
 *     handler kia bị ghi đè im lặng; tệ hơn, khi bên có handler đang thắng unmount
 *     (vd rời trang /notifications), nó unsubscribe khỏi stompClient luôn, khiến bên
 *     còn lại (Dropdown) tưởng vẫn còn kết nối nhưng thực chất đã mất realtime.
 *
 * BÂY GIỜ: hook chỉ là 1 lớp mỏng bọc quanh cache DUY NHẤT của notificationApi (cùng
 * cache mà NotificationDropdown dùng) + 1 subscription realtime DUY NHẤT (ref-counted
 * trong useNotificationsRealtime). Mọi consumer (Dropdown, NotificationsPage, Sidebar,
 * BottomNav) đọc/ghi chung 1 nguồn -> luôn đồng bộ, và chỉ còn 1 handler WS thật sự.
 */
export function useNotifications() {
  const {
    data,
    isLoading,
    isFetching,
    error: listError,
    refetch,
  } = useGetNotificationsQuery();
  const { data: unreadCount = 0, refetch: refetchUnreadCount } =
    useCountUnreadQuery();
  const [triggerLoadMore, { isFetching: isLoadingMore }] =
    useLazyGetNotificationsQuery();
  const [markAsReadMutation] = useMarkAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllAsReadMutation();

  // 1 subscription WS duy nhất cho toàn app, cập nhật thẳng vào cache bên dưới.
  useNotificationsRealtime();

  const notifications = data?.content ?? [];
  const hasMore = data?.hasNext ?? false;
  const cursor = data?.nextCursor ?? null;

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor) return;
    await triggerLoadMore({ cursor });
  }, [hasMore, cursor, triggerLoadMore]);

  const markAsRead = useCallback(
    (id: string) => {
      markAsReadMutation(id);
    },
    [markAsReadMutation],
  );

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation();
  }, [markAllAsReadMutation]);

  const fetchUnreadCount = useCallback(async () => {
    await refetchUnreadCount();
  }, [refetchUnreadCount]);

  return {
    notifications,
    // isLoading: true CHỈ khi chưa có data nào trong cache (lần tải đầu / cache rỗng).
    // isFetching: true trong MỌI lần request (kể cả refetch nền) - dùng cho spinner nhỏ,
    // không nên dùng để thay thế toàn bộ list bằng skeleton (gây chớp/gap không cần thiết).
    isLoading,
    isFetching,
    isLoadingMore,
    error: listError
      ? typeof listError === "object" &&
        listError !== null &&
        "data" in listError &&
        typeof (listError as { data?: unknown }).data === "string"
        ? (listError as { data: string }).data
        : "Failed to load notifications"
      : null,
    unreadCount,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    fetchUnreadCount,
    refetch,
  };
}
