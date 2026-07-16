import { useCallback, useEffect, useRef } from "react";
import { stompClient } from "../../../config/stompClient";
import {
  acquireMessageRealtimeBus,
  subscribeRawMessages,
  subscribeConversationTopic,
} from "./messageRealtimeBus";
import type {
  AddNewMembersEvent,
  ChatMessage,
  MessageDeletedNotificationEvent,
  PendingMessageNotificationEvent,
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
   * Tin nhắn PRIVATE đầu tiên từ 1 người CHƯA mutual-follow (myStatus sẽ là
   * PENDING) — kênh riêng /user/queue/pending.
   * TODO: BE XÁC NHẬN CHƯA CÓ destination này (subscribe thử làm
   * ExecutorSubscribableChannel[clientInboundChannel] lỗi) — callback này
   * tạm thời KHÔNG được gọi tới. Banner "Chấp nhận" trong ChatPage vẫn hoạt
   * động bình thường vì nó đọc `myStatus` từ REST GET /v1/conversations/{id},
   * không phụ thuộc event realtime này.
   */
  onPending?: (event: PendingMessageNotificationEvent) => void;
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
 *  - /user/queue/messages               : MessageNotificationEvent (PRIVATE)
 *  - /user/queue/notifications          : NotificationEvent (mọi loại, kể cả
 *                                          CREATED_GROUP khi được thêm vào group mới)
 *  - /topic/conversations/{id}/messages : MessageNotificationEvent (PRIVATE) & GroupMessageEvent (GROUP)
 *  - /topic/conversations/{id}/event    : MessageDeletedNotificationEvent — XÁC NHẬN
 *                                          từ code handler BE thật (không còn suy đoán).
 *                                          BUG ĐÃ SỬA: trước đây subscribe nhầm
 *                                          "/topic/conversations/{id}/messages/deleted"
 *                                          (đoán tên, không tồn tại) nên xoá/thu hồi tin
 *                                          nhắn không hề báo realtime cho người nhận.
 *
 * ĐÃ GỠ (không còn khớp tài liệu, từng bị BE deny "Failed to authorize
 * message... granted=false" vì không phải rule thiếu mà destination không
 * tồn tại thật sự) — LƯU Ý 2 path này KHÁC với "/topic/conversations/{id}/event"
 * (số NHIỀU "conversations") đã xác nhận ở trên, không phải cùng 1 chỗ:
 *  - "/topic/conversation/{id}/event" (số ÍT "conversation") — dùng cho AddNewMembersEvent/UpdateMemberRoleEvent
 *  - "/user/queue/conversations" — dùng cho onAddedToConversation
 *
 * TODO: hỏi lại BE destination thật cho 2 event trên (nếu có) rồi bật lại
 * onMembersAdded/onMemberRoleUpdated/onAddedToConversation tương ứng.
 *
 * subscribeConversation() KHÔNG tự gọi stompClient.subscribe trực tiếp nữa —
 * đi qua subscribeConversationTopic() (messageRealtimeBus.ts) để an toàn khi
 * nhiều nơi khác nhau (ChatPage đang mở + useConversationsRealtime app-root đã
 * subscribe sớm từ noti CREATED_GROUP) cùng quan tâm 1 conversationId.
 */
export function useMessageSocket({
  onMessage,
  onMessageDeleted,
  onPending,
}: UseMessageSocketOptions) {
  const { user } = useAuth();
  const seenMessageIdsRef = useRef(new Set<string>());
  // conversationId -> hàm release trả về từ subscribeConversationTopic.
  const releaseByConvIdRef = useRef(new Map<string, () => void>());
  const onMessageRef = useRef(onMessage);
  const onMessageDeletedRef = useRef(onMessageDeleted);
  const onPendingRef = useRef(onPending);
  onMessageRef.current = onMessage;
  onMessageDeletedRef.current = onMessageDeleted;
  onPendingRef.current = onPending;

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

  /** Subscribe các topic của 1 conversation cụ thể — gọi khi user mở 1 đoạn chat.
   *  An toàn gọi nhiều lần cho cùng 1 conversationId, kể cả từ hook instance khác,
   *  nhờ bus ref-counted trong messageRealtimeBus.ts. */
  const subscribeConversation = useCallback(
    (conversationId: string) => {
      if (!conversationId || releaseByConvIdRef.current.has(conversationId))
        return;
      const release = subscribeConversationTopic(
        conversationId,
        (body: any) => handleIncomingMessage(body),
        (body: any) => {
          if (body.messageId)
            onMessageDeletedRef.current?.(
              body as MessageDeletedNotificationEvent,
            );
        },
      );
      releaseByConvIdRef.current.set(conversationId, release);
    },
    [handleIncomingMessage],
  );

  useEffect(() => {
    if (!user) return;

    // "/user/queue/messages" đi qua bus dùng chung (ref-counted) — tránh ghi
    // đè handler nếu useConversationsRealtime cũng đang lắng nghe cùng lúc
    // (xem messageRealtimeBus.ts). "/user/queue/pending" tạm KHÔNG subscribe
    // (BE chưa có destination này — xem TODO trong messageRealtimeBus.ts).
    const releaseBus = acquireMessageRealtimeBus();
    const unsubMessages = subscribeRawMessages((body: any) => {
      handleIncomingMessage(body);
      const convId = (body.message ?? body).conversationId;
      if (convId) subscribeConversation(convId);
    });

    return () => {
      unsubMessages();
      releaseBus();
      releaseByConvIdRef.current.forEach((release) => release());
      releaseByConvIdRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { subscribeConversation, isConnected: stompClient.isConnected() };
}
