import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  acquireMessageRealtimeBus,
  subscribeRawMessages,
} from "./messageRealtimeBus";
import { upsertConversationSummary } from "../store/conversationSlice";
import type { MessageResponse } from "../types/message.types";

/**
 * Cập nhật danh sách hội thoại (Sidebar, BottomNav, MessagesPage) theo thời
 * gian thực, kể cả khi KHÔNG có ChatPage nào đang mở, qua "/user/queue/messages"
 * (MessageNotificationEvent, PRIVATE): đẩy preview mới nhất lên đầu, tăng
 * unreadCount nếu không phải đang xem đúng conversation đó.
 *
 * Tin nhắn PRIVATE ĐẦU TIÊN từ 1 người lạ (chưa mutual-follow) vẫn đi qua
 * ĐÚNG kênh này (BE không có "/user/queue/pending" riêng — xem TODO trong
 * messageRealtimeBus.ts), chỉ khác là `conversationStatus` = PENDING, nên
 * conversation đó vẫn tự hiện lên sidebar bình thường (label "Đang chờ bạn
 * chấp nhận" ở ConversationList), chỉ là KHÔNG có toast riêng cho case này nữa.
 *
 * Ref-counted giống useNotificationsRealtime — nhiều component dùng useConversations()
 * song song vẫn chỉ mở 1 listener thật trên bus dùng chung (ref-count nằm sẵn
 * trong acquireMessageRealtimeBus, xem messageRealtimeBus.ts).
 */
export function useConversationsRealtime() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const activeConversationId = useSelector(
    (s: RootState) => s.conversation.activeConversationId,
  );

  useEffect(() => {
    if (!user) return;
    const releaseBus = acquireMessageRealtimeBus();

    const unsubMessages = subscribeRawMessages((body: any) => {
      const message: MessageResponse = body.message ?? body;
      if (!message?.conversationId) return;
      const isMine = message.senderId === user.id;
      const isActive = activeConversationId === message.conversationId;
      dispatch(
        upsertConversationSummary({
          conversationId: message.conversationId,
          type: "PRIVATE",
          displayName: message.senderUsername,
          displayAvatarUrl: message.senderAvatarUrl,
          myStatus: message.conversationStatus,
          peerId: message.senderId,
          lastMessageId: message.messageId,
          lastMessageContent: message.content,
          lastMessageSenderUsername: message.senderUsername,
          lastMessageAt: message.sentAt,
          incrementUnread: !isMine && !isActive,
        }),
      );
    });

    return () => {
      unsubMessages();
      releaseBus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeConversationId]);
}
