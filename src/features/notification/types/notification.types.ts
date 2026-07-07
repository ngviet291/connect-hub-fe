import type { UUID } from '../../../shared/types/common.types';
import type { PostAuthor } from '../../post/types/post.types';

export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW' | 'REPOST' | 'MENTION';

export interface AppNotification {
  id: UUID;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  actor: PostAuthor;
  targetPostId?: UUID;
}
