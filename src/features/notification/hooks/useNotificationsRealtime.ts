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
 * Fan-out riêng cho noti "được thêm vào group" (NotificationType.CREATED_GROUP,
 * chỉ bắn đúng 1 lần lúc tạo group) — feature `message` (useConversationsRealtime)
 * cần biết để subscribe sớm vào topic của conversation đó, không cần đợi F5.
 * KHÔNG tự subscribe "/user/queue/notifications" ở feature message vì destination
 * này CHỈ được phép có 1 handler thật (đã là handler bên dưới).
 */
const groupCreatedListeners = new Set<(noti: NotificationResponse) => void>();

export function subscribeGroupCreatedNotifications(
  cb: (noti: NotificationResponse) => void,
): () => void {
  groupCreatedListeners.add(cb);
  return () => groupCreatedListeners.delete(cb);
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

          if (noti.type === "CREATED_GROUP") {
            groupCreatedListeners.forEach((cb) => cb(noti));
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
