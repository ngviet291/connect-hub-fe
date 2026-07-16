import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../app/store";
import { stompClient } from "../../../config/stompClient";
import { notificationApi } from "../api/notificationApi";
import type { NotificationResponse } from "../types/notification.types";
import { useAuth } from "@/features/auth/hooks/useAuth";

// Nhiều component (NotificationDropdown, NotificationsPage) cùng gọi hook này song song.
// Chỉ mở 1 subscription WS thực sự — đếm số "người dùng" đang active, chỉ unsubscribe
// khi không còn ai dùng nữa (tránh 1 component unmount làm mất realtime của component còn lại).
let subscriberCount = 0;
let unsubscribeWs: (() => void) | null = null;

/**
 * Fan-out cho các noti LIÊN QUAN TỚI 1 CONVERSATION cụ thể — không chỉ
 * "được thêm vào group" (CREATED_GROUP) mà cả "có tin nhắn mới" (MESSAGE)
 * và "tin nhắn đầu tiên từ người lạ" (MESSAGE_PENDING).
 *
 * BUG ĐÃ SỬA: trước đây chỉ fan-out cho CREATED_GROUP. Giả định là mọi
 * MESSAGE/MESSAGE_PENDING đều tự trôi qua "/user/queue/messages" (kênh
 * useConversationsRealtime đã lắng nghe sẵn) nên không cần noti lo thêm —
 * nhưng trên thực tế có trường hợp kênh đó KHÔNG bắn (hoặc bắn trễ/thiếu),
 * nên Notification tab đã hiện noti (qua đúng kênh "/user/queue/notifications"
 * này) nhưng ConversationList/Sidebar không có gì mới cho tới khi F5 (F5 mới
 * chạy lại REST fetch thật ở useConversations vì cờ `hasFetched` reset).
 * Giờ: bất kỳ noti nào trong 3 loại trên cũng kích refetch-nếu-thiếu / subscribe
 * sớm topic của đúng conversation đó — an toàn gọi thừa vì
 * useConversationsRealtime tự check "đã có trong Redux chưa" trước khi refetch.
 */
const conversationRelatedListeners = new Set<
  (noti: NotificationResponse) => void
>();

export function subscribeConversationRelatedNotifications(
  cb: (noti: NotificationResponse) => void,
): () => void {
  conversationRelatedListeners.add(cb);
  return () => conversationRelatedListeners.delete(cb);
}

export function useNotificationsRealtime() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    subscriberCount += 1;
    stompClient.connect();

    if (!unsubscribeWs) {
      unsubscribeWs = stompClient.subscribe(
        "/user/queue/notifications",
        (body: unknown) => {
          const noti = body as NotificationResponse;

          dispatch(
            notificationApi.util.updateQueryData(
              "getNotifications",
              undefined,
              (draft) => {
                if (draft.content.some((n) => n.id === noti.id)) return;
                draft.content.unshift(noti);
              },
            ),
          );

          if (!noti.read) {
            dispatch(
              notificationApi.util.updateQueryData(
                "countUnread",
                undefined,
                (c) => c + 1,
              ),
            );
          }

          if (
            noti.type === "CREATED_GROUP" ||
            noti.type === "MESSAGE" ||
            noti.type === "MESSAGE_PENDING"
          ) {
            conversationRelatedListeners.forEach((cb) => cb(noti));
          }
        },
      );
    }

    return () => {
      subscriberCount -= 1;
      if (subscriberCount <= 0) {
        unsubscribeWs?.();
        unsubscribeWs = null;
        subscriberCount = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
}
