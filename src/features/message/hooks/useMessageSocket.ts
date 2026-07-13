import { useCallback, useEffect, useRef } from "react";
import { stompClient } from "../../../config/stompClient";
import type {
  AddNewMembersEvent,
  ChatMessage,
  MessageDeletedNotificationEvent,
  UpdateMemberRoleEvent,
} from "../types/message.types";
import { mapMessageResponse } from "../types/message.types";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface UseMessageSocketOptions {
  /** Tin nhắn mới (đã lọc trùng + lọc tin của chính mình) qua bất kỳ kênh nào */
  onMessage: (message: ChatMessage) => void;
  /** Tin nhắn bị xoá (soft-delete) trong 1 conversation đang mở */
  onMessageDeleted?: (event: MessageDeletedNotificationEvent) => void;
  /**
   * Member mới được thêm vào group đang mở.
   * TODO: chưa xác nhận được destination thật cho event này (xem ghi chú
   * trong JSDoc bên dưới) — callback tạm thời không được gọi tới.
   */
  onMembersAdded?: (event: AddNewMembersEvent) => void;
  /**
   * Role 1 thành viên trong group đang mở bị đổi.
   * TODO: chưa xác nhận được destination thật cho event này.
   */
  onMemberRoleUpdated?: (event: UpdateMemberRoleEvent) => void;
  /**
   * Chính user hiện tại vừa được thêm vào 1 group mới (chưa mở conversation đó).
   * TODO: chưa xác nhận được destination thật cho event này.
   */
  onAddedToConversation?: (event: AddNewMembersEvent) => void;
}

/**
 * Quản lý toàn bộ WebSocket realtime cho chat, khớp đúng tài liệu
 * "WebSocket Destinations" (chat module) đã xác nhận:
 *
 *  - /user/queue/messages                       : MessageNotificationEvent (PRIVATE)
 *  - /user/queue/notifications                  : NotificationEvent (mọi loại, kể cả group message khi chưa mở conversation)
 *  - /topic/conversations/{id}/messages         : MessageNotificationEvent (PRIVATE) & GroupMessageEvent (GROUP)
 *  - /topic/conversations/{id}/messages/deleted : MessageDeletedNotificationEvent
 *
 * ĐÃ GỠ (không còn khớp tài liệu, từng bị BE deny "Failed to authorize
 * message... granted=false" vì không phải rule thiếu mà destination không
 * tồn tại thật sự):
 *  - "/topic/conversation/{id}/event" (số ít) — dùng cho AddNewMembersEvent/UpdateMemberRoleEvent
 *  - "/user/queue/conversations" — dùng cho onAddedToConversation
 *
 * TODO: hỏi lại BE destination thật cho 2 event trên (nếu có) rồi bật lại
 * onMembersAdded/onMemberRoleUpdated/onAddedToConversation tương ứng.
 */
export function useMessageSocket({
  onMessage,
  onMessageDeleted,
}: UseMessageSocketOptions) {
  const { user } = useAuth();
  const seenMessageIdsRef = useRef(new Set<string>());
  const subscribedConvsRef = useRef(new Set<string>());
  const onMessageRef = useRef(onMessage);
  const onMessageDeletedRef = useRef(onMessageDeleted);
  onMessageRef.current = onMessage;
  onMessageDeletedRef.current = onMessageDeleted;

  const handleIncomingMessage = useCallback(
    (raw: any) => {
      // Payload thật là MessageNotificationEvent/GroupMessageEvent, message nằm ở field "message"
      const messageResponse = raw.message ?? raw;
      if (messageResponse.senderId && messageResponse.senderId === user?.id)
        return; // bỏ qua tin của chính mình
      const id = messageResponse.messageId;
      if (id && seenMessageIdsRef.current.has(id)) return; // đã nhận qua kênh khác (topic + user-queue)
      if (id) seenMessageIdsRef.current.add(id);
      onMessageRef.current(mapMessageResponse(messageResponse));
    },
    [user?.id],
  );

  /** Subscribe các topic của 1 conversation cụ thể — gọi khi user mở 1 đoạn chat */
  const subscribeConversation = useCallback(
    (conversationId: string) => {
      if (!conversationId || subscribedConvsRef.current.has(conversationId))
        return;

      stompClient.subscribe(
        `/topic/conversations/${conversationId}/messages`,
        (body: any) => {
          handleIncomingMessage(body);
        },
      );

      stompClient.subscribe(
        `/topic/conversations/${conversationId}/messages/deleted`,
        (body: any) => {
          if (body.messageId)
            onMessageDeletedRef.current?.(
              body as MessageDeletedNotificationEvent,
            );
        },
      );

      subscribedConvsRef.current.add(conversationId);
    },
    [handleIncomingMessage],
  );

  useEffect(() => {
    if (!user) return;

    stompClient.connect();

    stompClient.subscribe("/user/queue/messages", (body: any) => {
      handleIncomingMessage(body);
      const convId = (body.message ?? body).conversationId;
      if (convId) subscribeConversation(convId);
    });

    return () => {
      stompClient.unsubscribe("/user/queue/messages");
      subscribedConvsRef.current.forEach((convId) => {
        stompClient.unsubscribe(`/topic/conversations/${convId}/messages`);
        stompClient.unsubscribe(
          `/topic/conversations/${convId}/messages/deleted`,
        );
      });
      subscribedConvsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { subscribeConversation, isConnected: stompClient.isConnected() };
}
