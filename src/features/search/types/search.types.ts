import type { UUID } from "@/shared/types/common.types";
import type { Post, PostAuthor } from "@/features/post/types/post.types";

export interface UserSearchResponse {
  id: UUID;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  isFollowing?: boolean;
}

export interface SearchPostResponse extends Omit<Post, "user"> {
  author: PostAuthor;
}

export interface HashtagSearchResponse {
  id: UUID;
  name: string;
  postCount?: number;
}

export interface SearchUsersParams {
  keyword: string;
  cursor?: string;
  size?: number;
}

export interface SearchState {
  users: UserSearchResponse[];
  posts: Post[];
  hashtags: HashtagSearchResponse[];
}
