export const FOLLOW_ENDPOINTS = {
  FOLLOW: (targetUserId: string) => `/v1/users/${targetUserId}/follow`,
  UNFOLLOW: (targetUserId: string) => `/v1/users/${targetUserId}/unfollow`,
  FOLLOWING: (username: string) => `/v1/follow/${username}/following`,
  FOLLOWERS: (username: string) => `/v1/follow/${username}/followers`,
  USER_STATS: (userId: string) => `/v1/users/${userId}/stats`,
};
