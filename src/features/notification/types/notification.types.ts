import type { UUID } from "../../../shared/types/common.types";

export type NotificationType =
  | "FOLLOW"
  | "REACTION"
  | "MESSAGE"
  | "COMMENT"
  | "LIKE"
  | "MENTION"
  | "SYSTEM"
  | "REPOST"
  | "MESSAGE_PENDING";

export interface NotificationResponse {
  id: UUID;
  content: string;
  // BE trả null với các loại noti không gắn bài viết (vd: FOLLOW)
  targetUrl: string | null;
  type: NotificationType;
  // BE trả null với các loại noti không gắn bài viết (vd: FOLLOW)
  post: PostSummaryResponse | null;
  user: NotificationUserSummaryResponse;
  read: boolean;
  createdAt: Date;
}

export interface NotificationUserSummaryResponse {
  id: UUID;
  username: string;
  avatarUrl?: string;
}

export interface PostSummaryResponse {
  id: UUID;
}

export interface NotificationUnreadResponse {
  unreadCount: number;
}
