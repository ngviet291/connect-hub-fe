export const USER_ENDPOINTS = {
  PROFILE: `/v1/users`,
  USER_BY_ID: (id: string) => `/v1/users/${id}`,
  FOLLOWERS_BY_ID: (id: string) => `/v1/admin/users/${id}/followers`,
  FOLLOWING_BY_ID: (id: string) => `/v1/admin/users/${id}/following`,
  USER_BY_USERNAME: (username: string) => `/v1/users/username/${username}`,
  FOLLOW_USER: (id: string) => `/v1/users/${id}/follow`,
  UNFOLLOW_USER: (id: string) => `/v1/users/${id}/unfollow`,

  SEARCH: `/v1/users/search`,
  
  AVATAR: `/v1/users/avatar`,
  STATUS: `/v1/users/status`,
  STATS: `/v1/users/stats`,
  ADMIN_USERS: `/v1/admin/users/allusers`,
  ADMIN_USERS_LOCK: (id: string) => `/v1/users/${id}/lock`,
  ADMIN_USERS_UNLOCK: (id: string) => `/v1/users/${id}/unlock`,
  USERS_BLOCK: (id: string) => `/v1/users/${id}/block`,
  USERS_UNBLOCK: (id: string) => `/v1/users/${id}/unblock`,
  USERS_BLOCKED: `/v1/users/blocked`,
  USERS_BLOCK_STATUS: (id: string) => `/v1/${id}/block/status`,
} as const;
