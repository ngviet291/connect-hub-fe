import type { UUID } from "../../../shared/types/common.types";

/** Item rút gọn trả về từ /v1/users/followers và /v1/users/following */
export interface FollowUser {
  id: UUID;
  username: string;
  fullName: string;
  avatarUrl?: string;
  isFollowing: boolean; // mình có đang follow lại người này không
}

export interface UserStats {
  followersCount: number;
  followingCount: number;
  postsCount?: number;
}

export interface FollowResponse {
  followerId: UUID;
  followingId: UUID;
  success: boolean;
}

export interface UserSummaryResponse {
  id: UUID;
  username: string;
  fullName: string;
  avatarUrl?: string;
  isFollowing?: boolean; // mình có đang follow người này không
}
