import type { UUID } from '../../../shared/types/common.types';
import type { PostAuthor } from '../../post/types/post.types';

export interface ReplyItem {
  id: UUID;
  postId: UUID;
  content: string;
  createdAt: string;
  user: PostAuthor;
  likeCount: number;
  isLiked: boolean;
}

export interface CreateReplyRequest {
  postId: UUID;
  content: string;
}
