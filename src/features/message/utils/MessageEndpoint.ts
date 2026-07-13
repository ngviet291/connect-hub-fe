// Path phải khớp CHÍNH XÁC @RequestMapping của 3 controller BE:
//   ChatController          -> /v1/chat
//   ConversationController  -> /v1/conversations
//   MessageController       -> /v1/messages
//
// Không prefix ENV.API_URL — axiosClient đã có baseURL, theo đúng convention
// của FOLLOW_ENDPOINTS/NOTIFICATION_ENDPOINTS (xem guide.md mục 2.1).

export const MESSAGE_ENDPOINTS = {
  // ── ConversationController ──────────────────────────────────────
  CONVERSATIONS: "/v1/conversations",
  CONVERSATION_DETAIL: (conversationId: string) =>
    `/v1/conversations/${conversationId}`,
  CONVERSATION_ACCEPT: "/v1/conversations/accept",
  CONVERSATION_GROUP: "/v1/conversations/group",
  CONVERSATION_LEAVE: (conversationId: string) =>
    `/v1/conversations/${conversationId}/leave`,
  CONVERSATION_MEMBERS: (conversationId: string) =>
    `/v1/conversations/${conversationId}/members`,
  CONVERSATION_MEMBER_REMOVE: (conversationId: string, memberId: string) =>
    `/v1/conversations/${conversationId}/members/${memberId}/remove`,
  CONVERSATION_MEMBER_STATUS: (conversationId: string, memberId: string) =>
    `/v1/conversations/${conversationId}/members/${memberId}/status`,
  CONVERSATION_PRIVATE_EXISTS: (peerId: string) =>
    `/v1/conversations/private/${peerId}/exists`,

  // ── ChatController ──────────────────────────────────────────────
  SEND_MESSAGE: "/v1/chat/messages",
  MARK_AS_READ: (conversationId: string) => `/v1/chat/${conversationId}/read`,

  // ── MessageController ───────────────────────────────────────────
  MESSAGES: (conversationId: string) =>
    `/v1/messages/${conversationId}/messages`,
  DELETE_MESSAGE: (messageId: string) => `/v1/messages/${messageId}`,
} as const;
