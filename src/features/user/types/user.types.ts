import type { UUID } from '../../../shared/types/common.types';
export type UserRole = "ROLE_USER" | "ROLE_ADMIN";
export interface UserProfile {
  id: UUID;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  website?: string;
  roles: UserRole[];
  createdAt: string;
  location?: string;
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
