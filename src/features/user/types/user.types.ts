import type { UUID } from "../../../shared/types/common.types";
export type UserRole = "ROLE_USER" | "ROLE_ADMIN" | "ROLE_MODERATOR";
export interface UserProfile {
  id: UUID;
  username: string;
  fullName: string;
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
  fullName?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatarUrl?: string;
}

export interface UserListEntry {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  isFollowing?: boolean;
}
