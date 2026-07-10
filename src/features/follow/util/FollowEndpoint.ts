export const FOLLOW_ENDPOINTS = {
  FOLLOW: (targetUserId: string) => `/v1/users/${targetUserId}/follow`,
  UNFOLLOW: (targetUserId: string) => `/v1/users/${targetUserId}/unfollow`, 
    FOLLOWERS: `/v1/users/followers`,
    FOLLOWING: `/v1/users/following`,
    USER_STATS: `/v1/users/stats`,
}