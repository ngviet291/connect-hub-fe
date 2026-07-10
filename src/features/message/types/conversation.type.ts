import type { UUID } from '../../../shared/types/common.types';
import type { PostAuthor } from '../../post/types/post.types';

export type ConversationType = "PRIVATE" | "GROUP";
// Trạng thái conversation dưới góc nhìn của user hiện tại (mutual-follow gate cho PRIVATE)
export type ConversationStatus = "PENDING" | "ACCEPTED";
export type MemberRole = "OWNER" | "ADMIN" | "MEMBER";
export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export interface ConversationMember {
  userId: UUID;
  username: string;
  fullName: string;
  avatarUrl?: string;
  role: MemberRole;
}

export interface Conversation {
  id: UUID; // = conversationId từ backend, map lại cho khớp UI cũ
  type: ConversationType;
  displayName: string; // tên group, hoặc fullName của peer nếu PRIVATE
  avatarUrl?: string;
  peerId?: UUID; // chỉ có với PRIVATE — id của người còn lại
  members?: ConversationMember[]; // chỉ có với GROUP (hoặc khi fetch detail)
  lastMessage: string;
  lastMessageAt: string;
  lastMessageStatus?: MessageStatus;
  unreadCount: number;
  myStatus: ConversationStatus;

  /** @deprecated giữ lại để không phá UI cũ đang dùng participant.* — dùng members/peerId cho code mới */
  participant?: PostAuthor;
}



