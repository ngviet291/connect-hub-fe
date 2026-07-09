import type { UUID, Visibility } from '../../../shared/types/common.types';

export interface PostAuthor {
  id: UUID;
  username: string;
  fullName: string;
  avatarUrl?: string;
}

export interface PostMedia {
  id: UUID;
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

export interface Post {
  id: UUID;
  content: string;
  visibility: Visibility;
  createdAt: string;
  user: PostAuthor;
  media?: PostMedia[];
  likeCount: number;
  replyCount: number;
  repostCount: number;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
  repostOf?: Post;
}

export interface CreatePostRequest {
  content: string;
  visibility?: Visibility;
  media?: PostMedia[];
}
