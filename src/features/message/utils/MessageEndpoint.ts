import { ENV } from "@/config/env";

export const MESSAGE_ENDPOINTS = {
  CONVERSATIONS: `${ENV.API_URL}/v1/messages/conversations`,
  
  MESSAGES: (conversationId: string) =>
    `${ENV.API_URL}/v1/messages/conversations/${conversationId}/messages`,
  RECALL_MESSAGE: (conversationId: string, messageId: string) =>
    `${ENV.API_URL}/v1/messages/conversations/${conversationId}/messages/${messageId}`,
  REACT_TO_MESSAGE: (conversationId: string, messageId: string) =>
    `${ENV.API_URL}/v1/messages/conversations/${conversationId}/messages/${messageId}/reactions`,
} as const;
