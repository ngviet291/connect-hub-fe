import type { UUID } from '../../../shared/types/common.types';
import type { PostAuthor } from '../../post/types/post.types';

export interface Conversation {
  id: UUID;
  participant: PostAuthor;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface MessageAttachment {
  id: UUID;
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

export interface MessageReaction {
  emoji: string;
  userId: UUID;
}

export interface ChatMessage {
  id: UUID;
  conversationId: UUID;
  senderId: UUID;
  content: string;
  media?: MessageAttachment[];
  recalled?: boolean;
  replyToId?: UUID;
  reactions?: MessageReaction[];
  createdAt: string;
}
