import { useCallback, useEffect, useRef, useState } from "react";
import { messageService } from "../service/messageService";
import {
  mapMessageResponse,
  type ChatMessage,
  type MediaRequest,
} from "../types/message.types";
import { useConversations } from "./useConversations";
import { useMessageSocket } from "./useMessageSocket";

interface UseChatOptions {
  /** Hội thoại đã tồn tại — có thì ưu tiên dùng để load lịch sử + gửi tiếp */
  conversationId?: string;
  /**
   * Chỉ cần khi CHƯA có conversationId (mở chat lần đầu với 1 user) — BE
   * (ChatService.sendMessage) yêu cầu bắt buộc 1 trong 2: conversationId
   * hoặc recipientId.
   */
  recipientId?: string;
}

export const useChat = ({ conversationId, recipientId }: UseChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<string | undefined>(undefined);
  const isLoadingRef = useRef(false);
  const { markConversationRead } = useConversations();

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const res = await messageService.getMessages(conversationId);
      // BE trả res.content theo thứ tự DESC (mới nhất trước — dùng cursor
      // phân trang lùi về quá khứ). Mọi nơi khác trong hook này (gửi tin mới
      // nối vào CUỐI mảng, nhận tin qua WS nối vào CUỐI, loadMore() nối tin
      // CŨ hơn vào ĐẦU) đều giả định `messages` theo thứ tự ASC (cũ -> mới,
      // phần tử cuối luôn là tin mới nhất) để khớp UX chat thường (cuộn xuống
      // cuối = tin mới nhất) — nên phải đảo ngược lại ở đây trước khi set state.
      const mapped = [...res.content].reverse().map(mapMessageResponse);
      setMessages(mapped);
      cursorRef.current = res.nextCursor ?? undefined;
      setHasNext(res.hasNext);
      setError(null);
      const last = res.content[0]; // res.content (chưa đảo) — phần tử đầu vẫn là tin MỚI NHẤT theo thứ tự gốc DESC
      if (last) markConversationRead(conversationId, last.messageId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch messages");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [conversationId, markConversationRead]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  // ── Realtime: 1 hook DUY NHẤT sở hữu cả state lẫn subscription cho
  // conversation đang mở (guide.md mục 5 — tránh 2 nguồn cùng ghi vào 1 state).
  const { subscribeConversation } = useMessageSocket({
    onMessage: (incoming) => {
      if (incoming.conversationId !== conversationId) return; // tin của conversation khác — bỏ qua ở đây
      setMessages((prev) =>
        prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming],
      );
    },
    onMessageDeleted: (event) => {
      if (event.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === event.messageId
            ? { ...m, content: "", media: undefined, recalled: true }
            : m,
        ),
      );
    },
  });

  useEffect(() => {
    if (conversationId) subscribeConversation(conversationId);
  }, [conversationId, subscribeConversation]);
  /** Load thêm tin nhắn cũ hơn (cuộn lên) */
  const loadMore = useCallback(async () => {
    if (
      !conversationId ||
      isLoadingRef.current ||
      !hasNext ||
      !cursorRef.current
    )
      return;
    isLoadingRef.current = true;
    try {
      const res = await messageService.getMessages(
        conversationId,
        cursorRef.current,
      );
      // Cũng như fetchMessages: page "cũ hơn" này BE vẫn trả DESC (mới nhất
      // của PAGE ĐÓ trước) — phải đảo ngược trước khi ghép vào ĐẦU mảng, nếu
      // không thứ tự bên trong đoạn vừa nối sẽ bị ngược (mới -> cũ) giữa lòng
      // 1 mảng đang là cũ -> mới.
      setMessages((prev) => [
        ...[...res.content].reverse().map(mapMessageResponse),
        ...prev,
      ]);
      cursorRef.current = res.nextCursor ?? undefined;
      setHasNext(res.hasNext);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch messages");
    } finally {
      isLoadingRef.current = false;
    }
  }, [conversationId, hasNext]);

  const sendMessage = async (
    content: string,
    media?: MediaRequest[],
    replyToMessageId?: string,
  ) => {
    if (
      (!content.trim() && !media?.length) ||
      (!conversationId && !recipientId)
    )
      return;
    setIsSending(true);
    try {
      const response = await messageService.sendMessage({
        conversationId: conversationId ?? null,
        recipientId: conversationId ? null : (recipientId ?? null),
        content: content.trim(),
        replyToMessageId: replyToMessageId ?? null,
        media,
      });
      const mapped = mapMessageResponse(response);
      setMessages((prev) => [...prev, mapped]);
      return mapped; // <-- thêm: trả về để caller lấy conversationId khi chat mới
    } finally {
      setIsSending(false);
    }
  };

  /**
   * BE không có API "thu hồi" riêng — chỉ có xoá mềm (DELETE /v1/messages/{id},
   * status chuyển DELETED). FE hiển thị y hệt UX "recalled" cũ dựa vào status đó.
   */
  const recallMessage = async (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, content: "", media: undefined, recalled: true }
          : m,
      ),
    );
    await messageService.deleteMessage(messageId);
  };

  return {
    messages,
    isLoading,
    isSending,
    hasNext,
    error,
    sendMessage,
    recallMessage,
    loadMore,
    refetch: fetchMessages,
  };
};