import type { UUID } from "../../../shared/types/common.types";
import type { CursorResponse } from "../../../shared/types/api.types";

// ============================================================================
// Enum — phải khớp CHÍNH XÁC tên value với enum Java bên BE (chat module)
// ============================================================================

/** com.connecthub...chat.enums.ConversationType */
export type ConversationType = "PRIVATE" | "GROUP" | "PUBLIC";

/** com.connecthub...chat.enums.MemberRole */
export type MemberRole = "ADMIN" | "MEMBER";

/** com.connecthub...chat.enums.MemberStatus */
export type MemberStatus =
  | "PENDING"
  | "ACCEPTED"
  | "BLOCKED"
  | "REMOVED"
  | "LEFT";

/** com.connecthub...chat.enums.MessageStatus */
export type MessageStatus = "SENT" | "DELIVERED" | "READ" | "DELETED";

/**
 * com.connecthub...post.enums.MediaType — module post không nằm trong scope
 * upload zip này, để 2 giá trị đang được FE dùng thực tế (IMAGE/VIDEO).
 * Nếu BE có thêm value khác (vd DOCUMENT) thì bổ sung ở đây.
 */
export type MediaType = "IMAGE" | "VIDEO";

// ============================================================================
// Response DTO — khớp field-by-field với dto/response/*.java
// ============================================================================

/**
 * MediaResponse (nested trong MessageResponse.media[], trả về từ
 * POST /v1/chat/messages sau khi gửi tin nhắn) — ĐÃ XÁC NHẬN field thật từ
 * response thật của BE, KHÔNG giống bộ field suy đoán trước đây:
 *  - `id` (đoán) -> thực tế là `mediaId`
 *  - `size` (đoán) -> thực tế là `fileSize`
 *  - thêm `mimeType` và `publicId` (Cloudinary public_id) mà trước đây
 *    không biết BE có trả về.
 * `fileName`/`fileSize`/`mimeType` đều nullable thật sự (thấy `null` trong
 * response mẫu), không chỉ optional theo kiểu "có thể không có field".
 */
export interface MediaResponse {
  mediaId: UUID;
  url: string;
  type: MediaType;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  publicId?: string;
}

/** ConversationMemberResponse.java */
export interface ConversationMemberResponse {
  userId: UUID;
  username: string;
  avatarUrl?: string;
  role: MemberRole;
  status: MemberStatus;
}

/** ConversationSummaryResponse.java — dùng cho danh sách hội thoại (GET /v1/conversations) */
export interface ConversationSummaryResponse {
  conversationId: UUID;
  type: ConversationType;
  displayName: string;
  displayAvatarUrl?: string;
  /** Trạng thái CỦA CHÍNH MÌNH trong conversation này */
  myStatus: MemberStatus;
  lastMessageId?: UUID;
  lastMessageContent?: string;
  lastMessageSenderUsername?: string;
  lastMessageAt?: string;
  unreadCount: number;
  lastMessageStatus?: MessageStatus;
  /** Chỉ có ý nghĩa với PRIVATE, null với GROUP */
  peerId?: UUID;
}

/** ConversationDetailResponse.java — dùng khi mở 1 hội thoại (GET /v1/conversations/{id}) */
export interface ConversationDetailResponse {
  conversationId: UUID;
  type: ConversationType;
  displayName: string;
  displayAvatarUrl?: string;
  myStatus: MemberStatus;
  members: CursorResponse<ConversationMemberResponse>;
  createdAt: string;
}

/** MessageResponse.java */
export interface MessageResponse {
  messageId: UUID;
  content: string;
  sentAt: string;
  status: MessageStatus;
  conversationId: UUID;
  conversationStatus: MemberStatus;
  senderId: UUID;
  senderUsername: string;
  senderAvatarUrl?: string;
  media?: MediaResponse[];
}

/**
 * chat/dto/response/MediaUploadResponse.java — trả về từ
 * POST /v1/chat/messages/media (upload file lấy url thật trước khi gửi tin
 * nhắn media, xem ChatController.uploadMessageMedia()). Không có `id` (khác
 * MediaResponse ở trên) vì lúc này media chưa được lưu thành MessageMedia
 * trong DB, mới chỉ là file đã lên object storage.
 *
 * `publicId` (Cloudinary public_id) — XÁC NHẬN từ response thật, PHẢI gửi
 * lại kèm khi gọi sendMessage (SendMessageRequest.media[].publicId) chứ
 * không chỉ url/type/fileName/size như suy đoán ban đầu.
 */
export interface MediaUploadResponse {
  url: string;
  publicId: string;
  type: MediaType;
  fileName: string;
  size: number;
}

// ============================================================================
// Request DTO — khớp field-by-field với dto/request/*.java
// ============================================================================

/**
 * SendMessageRequest.MediaRequest (inner static class) — BUG ĐÃ SỬA: trước
 * đây thiếu `publicId`. Response thật của POST /v1/chat/messages/media có
 * trả `publicId` (Cloudinary public_id) và PHẢI gửi lại kèm field này khi
 * gọi sendMessage, không chỉ url/type/fileName/size như suy đoán ban đầu.
 */
export interface MediaRequest {
  url: string;
  publicId: string;
  type: MediaType;
  fileName?: string;
  size: number;
}

/** SendMessageRequest.java — conversationId và recipientId đều nullable (@RequiredUUID(nullable = true)) */
export interface SendMessageRequest {
  conversationId?: UUID | null;
  recipientId?: UUID | null;
  content?: string;
  replyToMessageId?: UUID | null;
  media?: MediaRequest[];
}

/** CreateGroupConversationRequest.java */
export interface CreateGroupConversationRequest {
  name?: string;
  members: UUID[]; // tối thiểu 2 phần tử
}

/** AddMembersRequest.java */
export interface AddMembersRequest {
  memberIds: UUID[];
}

/** UpdateMemberRoleRequest.java */
export interface UpdateMemberRoleRequest {
  role: MemberRole;
}

/** AcceptConversationRequest.java */
export interface AcceptConversationRequest {
  conversationId: UUID;
  userAccept: UUID;
}

/**
 * UpdateConversationRequest.java — BE nhận qua @ModelAttribute (multipart/form-data),
 * KHÔNG phải JSON. Service phải build FormData từ object này.
 */
export interface UpdateConversationRequest {
  name?: string;
  avatar?: File;
}

// ============================================================================
// WebSocket event payload — khớp field-by-field với event/*.java (DomainEvent)
// BE gửi nguyên object event xuống STOMP, không unwrap ApiResponse.
// ============================================================================

/** MessageNotificationEvent.java — đẩy tới /topic/conversations/{id}/messages và /user/{recipientId}/queue/messages */
export interface MessageNotificationEvent {
  recipientId: UUID;
  message: MessageResponse;
  conversationType: ConversationType;
}

/** GroupMessageEvent.java — đẩy tới /topic/conversations/{id}/messages (group) */
export interface GroupMessageEvent {
  conversationId: UUID;
  message: MessageResponse;
}

/** MessageDeletedNotificationEvent.java — đẩy tới /topic/conversations/{id}/event */
export interface MessageDeletedNotificationEvent {
  messageId: UUID;
  conversationId: UUID;
}

/** AddNewMembersEvent.java — đẩy tới /topic/conversation/{id}/event và /user/{memberId}/queue/conversations */
export interface AddNewMembersEvent {
  conversationId: UUID;
  newMembers: ConversationMemberResponse[];
}

/** UpdateMemberRoleEvent.java — đẩy tới /topic/conversation/{id}/event */
export interface UpdateMemberRoleEvent {
  conversationId: UUID;
  memberResponse: ConversationMemberResponse;
}

/**
 * PendingMessageNotificationEvent.java — đẩy tới /user/{recipientId}/queue/pending khi
 * người lạ (chưa mutual-follow) gửi tin nhắn PRIVATE đầu tiên. BE tách kênh riêng
 * (không đi qua /user/queue/messages) để FE phân biệt được "cần Accept" ngay từ
 * event, không phải suy luận qua conversationStatus.
 */
export interface PendingMessageNotificationEvent {
  senderId: UUID;
  senderUsername: string;
  senderAvatarUrl?: string;
  firstMessagePreview: string;
  messageResponse: MessageResponse;
}

// ============================================================================
// UI-shape — dùng nội bộ trong hook/component, map 1-1 từ response BE.
// Giữ để không phải sửa lại toàn bộ component UI hiện có, nhưng field
// bắt buộc phải trace được về đúng response gốc (xem mapMessageResponse).
// ============================================================================

export interface ChatMessage {
  id: UUID; // = messageId
  conversationId: UUID;
  senderId: UUID;
  senderUsername: string;
  senderAvatarUrl?: string;
  content: string;
  media?: MediaResponse[];
  /** suy ra từ status === 'DELETED', KHÔNG phải field riêng của BE */
  recalled: boolean;
  status: MessageStatus;
  createdAt: string; // = sentAt
}

export const mapMessageResponse = (raw: MessageResponse): ChatMessage => ({
  id: raw.messageId,
  conversationId: raw.conversationId,
  senderId: raw.senderId,
  senderUsername: raw.senderUsername,
  senderAvatarUrl: raw.senderAvatarUrl,
  content: raw.content,
  media: raw.media,
  recalled: raw.status === "DELETED",
  status: raw.status,
  createdAt: raw.sentAt,
});

export interface ConversationExistsResponse {
  conversationId: UUID | null;
}
