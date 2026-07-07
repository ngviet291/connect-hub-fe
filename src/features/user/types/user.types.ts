import type { UUID } from '../../../shared/types/common.types';

export interface UserProfile {
  id: UUID;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  website?: string;
  location?: string;
  joinedAt?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  isPrivate?: boolean;
  isVerified?: boolean;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatarUrl?: string;
}
