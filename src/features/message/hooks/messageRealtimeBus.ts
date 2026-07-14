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