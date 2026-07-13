import { getErrorMessage } from "@/constants/errorMessage";
import axiosClient from "../../../config/axiosClient";
import type { ApiResponse, CursorResponse } from "../../../shared/types/api.types";
import type { MessageResponse, SendMessageRequest } from "../types/message.types";
import { MESSAGE_ENDPOINTS } from "../utils/MessageEndpoint";

const CODE = {
  SEND_MESSAGE: 201,
  MARK_AS_READ: 200,
  GET_MESSAGES: 200,
} as const;

export const messageService = {
  /**
   * POST /v1/chat/messages — gửi tin nhắn đầu tiên (recipientId, không có
   * conversationId) hoặc gửi tiếp vào 1 conversation đã tồn tại (conversationId).
   * KHÔNG được gửi cả 2 rỗng — BE validate qua @ValidSendMessageTarget.
   */
  sendMessage: async (request: SendMessageRequest): Promise<MessageResponse> => {
    try {
      const res = await axiosClient.post<ApiResponse<MessageResponse>>(
        MESSAGE_ENDPOINTS.SEND_MESSAGE,
        request,
      );
      const data = res.data;
      if (!data || data.code !== CODE.SEND_MESSAGE || !data.data) {
        throw new Error(getErrorMessage(data.message, "Failed to send message"));
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to send message"));
    }
  },

  /** PUT /v1/chat/{conversationId}/read?lastMessageId=... */
  markAsRead: async (conversationId: string, lastMessageId: string): Promise<void> => {
    try {
      const res = await axiosClient.put<ApiResponse<void>>(
        MESSAGE_ENDPOINTS.MARK_AS_READ(conversationId),
        null,
        { params: { lastMessageId } },
      );
      const data = res.data;
      if (!data || data.code !== CODE.MARK_AS_READ) {
        throw new Error(getErrorMessage(data.message, "Failed to mark as read"));
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to mark as read"));
    }
  },

  /** GET /v1/messages/{conversationId}/messages?cursor&limit */
  getMessages: async (
    conversationId: string,
    cursor?: string,
    limit = 20,
  ): Promise<CursorResponse<MessageResponse>> => {
    try {
      const res = await axiosClient.get<ApiResponse<CursorResponse<MessageResponse>>>(
        MESSAGE_ENDPOINTS.MESSAGES(conversationId),
        { params: { limit, ...(cursor ? { cursor } : {}) } },
      );
      const data = res.data;
      if (!data || data.code !== CODE.GET_MESSAGES || !data.data) {
        throw new Error(getErrorMessage(data.message, "Failed to fetch messages"));
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to fetch messages"));
    }
  },

  /**
   * DELETE /v1/messages/{messageId} — 204 No Content, không có ApiResponse
   * body để check code. BE soft-delete (set status DELETED), realtime báo
   * qua MessageDeletedNotificationEvent trên /topic/conversations/{id}/event.
   */
  deleteMessage: async (messageId: string): Promise<void> => {
    try {
      await axiosClient.delete(MESSAGE_ENDPOINTS.DELETE_MESSAGE(messageId));
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to delete message"));
    }
  },
};
