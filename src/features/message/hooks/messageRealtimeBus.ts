import { stompClient } from "../../../config/stompClient";
import type { PendingMessageNotificationEvent } from "../types/message.types";

/**
 * stompClient chỉ giữ ĐÚNG 1 handler cho mỗi destination (xem comment trong
 * useNotificationsRealtime.ts) — nếu 2 nơi khác nhau (ChatPage đang mở 1
 * conversation, và Sidebar/ConversationList cần cập nhật preview realtime)
 * cùng tự gọi stompClient.subscribe("/user/queue/messages", ...) thì handler
 * subscribe sau sẽ ghi đè im lặng handler subscribe trước.
 *
 * Bus này mở ĐÚNG 1 subscription thật cho "/user/queue/messages" (ref-counted),
 * rồi phát lại (fan-out) cho mọi listener đã đăng ký — dùng bởi cả
 * useMessageSocket (ChatPage đang mở) lẫn useConversationsRealtime (cập nhật
 * danh sách hội thoại toàn app).
 *
 * "/user/queue/notifications" KHÔNG được subscribe ở đây — kênh đó đã thuộc về
 * useNotificationsRealtime (feature notification), xem bus riêng
 * (subscribeConversationRelatedNotifications) export từ đó.
 *
 * TODO: "/user/queue/pending" — BE XÁC NHẬN CHƯA CÓ destination này (không
 * phải lỗi thiếu quyền, mà route không tồn tại; subscribe vào sẽ làm
 * ExecutorSubscribableChannel[clientInboundChannel] bắn lỗi và ảnh hưởng cả
 * kết nối WS dùng chung). ĐÃ TẮT subscribe thật — chỉ còn giữ lại type +
 * subscribePendingMessages() làm sẵn "chỗ cắm" để bật lại khi BE có route
 * thật. Không tự ý đoán/đổi tên destination khác thay thế.
 */
type RawMessageHandler = (body: any) => void;
type PendingHandler = (event: PendingMessageNotificationEvent) => void;

const messageListeners = new Set<RawMessageHandler>();
const pendingListeners = new Set<PendingHandler>();

let refCount = 0;
let unsubMessages: (() => void) | null = null;

function ensureSubscribed() {
  if (unsubMessages) return;
  stompClient.connect();
  unsubMessages = stompClient.subscribe("/user/queue/messages", (body: any) => {
    messageListeners.forEach((cb) => cb(body));
  });
  // "/user/queue/pending" tạm thời KHÔNG subscribe — xem TODO phía trên.
}

function teardownIfUnused() {
  if (refCount > 0) return;
  unsubMessages?.();
  unsubMessages = null;
}

/** Gọi 1 lần khi 1 consumer mount — trả về hàm release, gọi khi unmount. */
export function acquireMessageRealtimeBus(): () => void {
  refCount += 1;
  ensureSubscribed();
  return () => {
    refCount = Math.max(0, refCount - 1);
    teardownIfUnused();
  };
}

export function subscribeRawMessages(cb: RawMessageHandler): () => void {
  messageListeners.add(cb);
  return () => messageListeners.delete(cb);
}

/**
 * TODO: không có destination thật ở BE nên listener đăng ký qua hàm này
 * hiện KHÔNG BAO GIỜ được gọi. Giữ lại API để useMessageSocket/
 * useConversationsRealtime không phải sửa lại khi BE bổ sung route thật.
 */
export function subscribePendingMessages(cb: PendingHandler): () => void {
  pendingListeners.add(cb);
  return () => pendingListeners.delete(cb);
}

// ============================================================================
// Bus riêng cho "/topic/conversations/{id}/messages" + ".../event"
// — dùng chung giữa nhiều consumer khác nhau đang cùng quan tâm 1 conversationId
// (vd: ChatPage đang mở conversation đó, VÀ useConversationsRealtime app-root đã
// chủ động subscribe sớm từ noti CREATED_GROUP). Cùng lý do với bus ở trên: mỗi
// destination CHỈ được 1 lần stompClient.subscribe thật, mọi consumer khác phải
// "ăn ké" qua subscribeConversationTopic() dưới đây, không tự gọi
// stompClient.subscribe trực tiếp cho các destination này ở nơi khác.
// ============================================================================
interface ConversationTopicEntry {
  refCount: number;
  teardown: () => void;
  messageListeners: Set<(body: any) => void>;
  deletedListeners: Set<(body: any) => void>;
}

const conversationTopics = new Map<string, ConversationTopicEntry>();

/**
 * Subscribe "/topic/conversations/{conversationId}/messages" (+ ".../event").
 * Ref-counted theo từng conversationId — nhiều consumer cùng gọi cho cùng 1 id
 * vẫn chỉ mở 1 subscription thật; unsubscribe thật sự chỉ xảy ra khi consumer
 * CUỐI CÙNG quan tâm tới conversationId đó rời đi.
 */
export function subscribeConversationTopic(
  conversationId: string,
  onMessage: (body: any) => void,
  onDeleted?: (body: any) => void,
): () => void {
  let entry = conversationTopics.get(conversationId);
  if (!entry) {
    const messageListeners = new Set<(body: any) => void>();
    const deletedListeners = new Set<(body: any) => void>();
    stompClient.connect();
    const unsubMsgs = stompClient.subscribe(
      `/topic/conversations/${conversationId}/messages`,
      (body: any) => messageListeners.forEach((cb) => cb(body)),
    );
    // BUG ĐÃ SỬA: trước đây subscribe nhầm "/messages/deleted" (đoán theo tên,
    // KHÔNG xác nhận với BE) — destination đó không tồn tại nên xoá/thu hồi
    // tin nhắn KHÔNG BAO GIỜ báo realtime cho các thành viên khác trong cuộc
    // trò chuyện (chỉ người bấm xoá thấy do tự optimistic-update UI local, xem
    // useChat.recallMessage). Đã xác nhận đúng destination thật từ code BE
    // (MessageDeletedNotificationHandler): "/topic/conversations/{id}/event"
    // — số NHIỀU "conversations" (khác hẳn "/topic/conversation/{id}/event" số
    // ÍT đã bị gỡ trước đó vì BE deny — 2 path này KHÁC NHAU, không phải cùng 1
    // chỗ đã thử rồi thất bại).
    const unsubDeleted = stompClient.subscribe(
      `/topic/conversations/${conversationId}/event`,
      (body: any) => deletedListeners.forEach((cb) => cb(body)),
    );
    entry = {
      refCount: 0,
      teardown: () => {
        unsubMsgs();
        unsubDeleted();
      },
      messageListeners,
      deletedListeners,
    };
    conversationTopics.set(conversationId, entry);
  }

  entry.refCount += 1;
  entry.messageListeners.add(onMessage);
  if (onDeleted) entry.deletedListeners.add(onDeleted);

  return () => {
    const e = conversationTopics.get(conversationId);
    if (!e) return;
    e.messageListeners.delete(onMessage);
    if (onDeleted) e.deletedListeners.delete(onDeleted);
    e.refCount -= 1;
    if (e.refCount <= 0) {
      e.teardown();
      conversationTopics.delete(conversationId);
    }
  };
}
