import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  acquireMessageRealtimeBus,
  subscribeRawMessages,
  subscribeConversationTopic,
} from "./messageRealtimeBus";
import { upsertConversationSummary } from "../store/conversationSlice";
import { useConversations } from "./useConversations";
import {
  useNotificationsRealtime,
  subscribeGroupCreatedNotifications,
} from "@/features/notification/hooks/useNotificationsRealtime";
import type { NotificationResponse } from "@/features/notification/types/notification.types";
import type { GroupMessageEvent, MessageResponse } from "../types/message.types";

/**
 * Cập nhật danh sách hội thoại (Sidebar, BottomNav, MessagesPage) theo thời
 * gian thực, kể cả khi KHÔNG có ChatPage nào đang mở, qua 2 nguồn:
 *
 *  - "/user/queue/messages" (qua messageRealtimeBus) : CHỈ tin PRIVATE
 *    (MessageNotificationEvent) — đẩy preview mới nhất lên đầu, tăng
 *    unreadCount nếu không phải đang xem đúng conversation đó.
 *  - noti NotificationType.CREATED_GROUP trên "/user/queue/notifications" :
 *    bắn ĐÚNG 1 lần lúc tạo group, tới mọi member. Kênh WS đó đã bị
 *    useNotificationsRealtime (feature notification) subscribe riêng cho
 *    chuông thông báo — destination chỉ được phép có 1 handler thật, nên ở
 *    đây KHÔNG subscribe lại mà "ăn ké" qua subscribeGroupCreatedNotifications()
 *    (bus nội bộ feature notification export ra).
 *
 *    Khi nhận noti này: (1) subscribe NGAY vào
 *    "/topic/conversations/{id}/messages" của group đó (qua
 *    subscribeConversationTopic, sống suốt phiên) — từ đây mọi tin nhắn GROUP
 *    tới sau chảy thẳng qua topic như PRIVATE vẫn làm qua
 *    "/user/queue/messages", không cần noti riêng cho từng tin nữa; (2) nếu
 *    conversation chưa có trong Redux thì refetch REST 1 lần để lấy
 *    displayName/avatar group thật (noti không có đủ field để tự dựng —
 *    `user` trong NotificationResponse là actor tạo group, không phải group).
 *
 *    Lưu ý: refetch() dispatch fetchStart() → isLoading = true tạm thời, nên
 *    ConversationList có thể chớp skeleton 1 nhịp khi noti này tới, kể cả khi
 *    user đang nhìn sidebar sẵn có dữ liệu. Chấp nhận đánh đổi này để tránh
 *    hiện data sai/thiếu; có thể tối ưu sau bằng 1 action "refetch silent" nếu
 *    thấy khó chịu.
 *
 * Tin nhắn PRIVATE ĐẦU TIÊN từ 1 người lạ (chưa mutual-follow) vẫn đi qua
 * ĐÚNG "/user/queue/messages" (BE không có "/user/queue/pending" riêng — xem
 * TODO trong messageRealtimeBus.ts), chỉ khác `conversationStatus` = PENDING,
 * nên conversation đó vẫn tự hiện lên sidebar bình thường (label "Đang chờ
 * bạn chấp nhận" ở ConversationList).
 *
 * Ref-counted giống useNotificationsRealtime — nhiều component dùng
 * useConversations() song song vẫn chỉ mở 1 listener thật trên bus dùng
 * chung (ref-count nằm sẵn trong acquireMessageRealtimeBus).
 */
function extractConversationIdFromTargetUrl(
  targetUrl: string | null,
): string | null {
  if (!targetUrl) return null;
  // TODO: giả định targetUrl có dạng "/messages/{conversationId}" khớp route
  // ChatPage ("/messages/:conversationId") — chưa thấy case nào khác trong
  // NotificationItem.tsx (chỉ dùng thẳng làm navigate target). Nếu BE đổi
  // format thì regex này cần cập nhật theo.
  const match = targetUrl.match(/^\/messages\/([^/?]+)/);
  return match?.[1] ?? null;
}

export function useConversationsRealtime() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const activeConversationId = useSelector(
    (s: RootState) => s.conversation.activeConversationId,
  );
  const conversations = useSelector(
    (s: RootState) => s.conversation.conversations,
  );
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;
  const pendingRefetchRef = useRef(false);
  const { refetch } = useConversations();
  // Giữ release fn của các group đã subscribeConversationTopic từ noti
  // CREATED_GROUP — sống suốt phiên làm việc, không unsubscribe theo effect
  // cleanup bên dưới (effect đó re-run mỗi khi activeConversationId đổi).
  const topicReleasesRef = useRef(new Map<string, () => void>());

  // Đảm bảo "/user/queue/notifications" luôn có người subscribe (an toàn khi
  // gọi thêm lần nữa — ref-counted, xem comment trong useNotificationsRealtime.ts),
  // kể cả khi không có NotificationDropdown/NotificationsPage nào đang mount.
  useNotificationsRealtime();

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

    /** Cập nhật preview khi có tin GROUP mới tới qua topic đã subscribe sớm.
     *  Không cần biết displayName/avatar ở đây vì conversation chắc chắn ĐÃ có
     *  trong Redux lúc này (nếu chưa có thì nhánh refetch bên dưới đã lo trước
     *  khi tin nhắn thật tới). */
    const handleGroupTopicMessage = (conversationId: string) => (raw: any) => {
      const event = raw as GroupMessageEvent;
      const message: MessageResponse | undefined = event.message ?? raw.message ?? raw;
      if (!message?.messageId) return;
      const isMine = message.senderId === user.id;
      const isActive = activeConversationId === conversationId;
      const existing = conversationsRef.current.find(
        (c) => c.conversationId === conversationId,
      );
      dispatch(
        upsertConversationSummary({
          conversationId,
          type: "GROUP",
          displayName: existing?.displayName ?? "",
          displayAvatarUrl: existing?.displayAvatarUrl,
          myStatus: message.conversationStatus,
          lastMessageId: message.messageId,
          lastMessageContent: message.content,
          lastMessageSenderUsername: message.senderUsername,
          lastMessageAt: message.sentAt,
          incrementUnread: !isMine && !isActive,
        }),
      );
    };

    const subscribeToGroupTopic = (conversationId: string) => {
      if (topicReleasesRef.current.has(conversationId)) return;
      const release = subscribeConversationTopic(
        conversationId,
        handleGroupTopicMessage(conversationId),
      );
      topicReleasesRef.current.set(conversationId, release);
    };

    const unsubGroupCreated = subscribeGroupCreatedNotifications(
      (noti: NotificationResponse) => {
        const conversationId = extractConversationIdFromTargetUrl(
          noti.targetUrl,
        );
        if (!conversationId) return;

        // Subscribe ngay từ noti "được thêm vào group" — mọi tin nhắn GROUP
        // tới sau chảy thẳng qua topic, không cần noti riêng cho từng tin nữa.
        subscribeToGroupTopic(conversationId);

        if (
          conversationsRef.current.some(
            (c) => c.conversationId === conversationId,
          )
        )
          return;
        if (pendingRefetchRef.current) return;
        pendingRefetchRef.current = true;
        refetch().finally(() => {
          pendingRefetchRef.current = false;
        });
      },
    );

    return () => {
      unsubMessages();
      unsubGroupCreated();
      releaseBus();
      // KHÔNG release topicReleasesRef ở đây — xem comment ở khai báo ref.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeConversationId]);
}