import { useCallback, useEffect, useRef } from "react";
import { stompClient } from "../../../config/stompClient";
import { useAuth } from "../../auth/store/AuthContext";
import type { ChatMessage, PendingMessageEvent } from "../types/message.types";

interface UseMessageSocketOptions {
  /** Gọi khi nhận 1 tin nhắn mới (đã lọc trùng + lọc tin của chính mình) qua bất kỳ kênh nào */
  onMessage: (message: ChatMessage) => void;
  /** Gọi khi nhận notification "tin nhắn đầu tiên, đang chờ mutual-follow" (PRIVATE, PENDING) */
  onPendingMessage?: (event: PendingMessageEvent) => void;
}

/**
 * Quản lý toàn bộ phần WebSocket realtime cho chat:
 * - /user/queue/pending      : tin PRIVATE đầu tiên khi 2 bên chưa mutual-follow
 * - /user/queue/messages     : mọi tin nhắn gửi tới user hiện tại (đảm bảo nhận được tin đầu
 *                              của 1 conversation mới dù chưa từng subscribe topic đó)
 * - /topic/conversations/:id/messages : tin nhắn realtime trong 1 conversation đang mở
 *
 * Logic chống nhận trùng (1 tin có thể tới qua cả user-queue lẫn topic) giữ nguyên
 * theo đúng bản hook test gốc (seenMessageIdsRef).
 */
export function useMessageSocket({
  onMessage,
  onPendingMessage,
}: UseMessageSocketOptions) {
  const { user } = useAuth();
  const seenMessageIdsRef = useRef(new Set<string>());
  const subscribedConvsRef = useRef(new Set<string>());
  const onMessageRef = useRef(onMessage);
  const onPendingRef = useRef(onPendingMessage);
  onMessageRef.current = onMessage;
  onPendingRef.current = onPendingMessage;

  const handleIncoming = useCallback(
    (raw: any) => {
      if (raw.senderId && raw.senderId === user?.id) return; // bỏ qua tin của chính mình
      if (raw.messageId && seenMessageIdsRef.current.has(raw.messageId)) return; // đã nhận qua kênh khác
      if (raw.messageId) seenMessageIdsRef.current.add(raw.messageId);
      onMessageRef.current({ ...raw, id: raw.id ?? raw.messageId });
    },
    [user?.id],
  );

  /** Subscribe topic của 1 conversation cụ thể — gọi khi user mở 1 đoạn chat */
  const subscribeConversation = useCallback(
    (conversationId: string) => {
      if (!conversationId || subscribedConvsRef.current.has(conversationId))
        return;
      stompClient.subscribe(
        `/topic/conversations/${conversationId}/messages`,
        (body: any) => {
          handleIncoming(body.message ?? body);
        },
      );
      subscribedConvsRef.current.add(conversationId);
    },
    [handleIncoming],
  );

  useEffect(() => {
    if (!user) return;

    stompClient.connect();

    stompClient.subscribe("/user/queue/pending", (body: any) => {
      onPendingRef.current?.(body as PendingMessageEvent);
      const convId = body.messageResponse?.conversationId;
      if (body.messageResponse) handleIncoming(body.messageResponse);
      if (convId) subscribeConversation(convId);
    });

    stompClient.subscribe("/user/queue/messages", (body: any) => {
      const msg = body.message ?? body;
      handleIncoming(msg);
      if (msg.conversationId) subscribeConversation(msg.conversationId);
    });

    return () => {
      stompClient.unsubscribe("/user/queue/pending");
      stompClient.unsubscribe("/user/queue/messages");
      subscribedConvsRef.current.forEach((convId) =>
        stompClient.unsubscribe(`/topic/conversations/${convId}/messages`),
      );
      subscribedConvsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { subscribeConversation, isConnected: stompClient.isConnected() };
}
