import { getErrorMessage } from "@/constants/errorMessage";
import axiosClient from "../../../config/axiosClient";
import type {
  ApiResponse,
  CursorResponse,
} from "../../../shared/types/api.types";
import type {
  MediaUploadResponse,
  MessageResponse,
  SendMessageRequest,
} from "../types/message.types";
import { MESSAGE_ENDPOINTS } from "../utils/MessageEndpoint";

const CODE = {
  SEND_MESSAGE: 201,
  MARK_AS_READ: 200,
  GET_MESSAGES: 200,
  UPLOAD_MESSAGE_MEDIA: 201,
} as const;

export const messageService = {
  /**
   * POST /v1/chat/messages — gửi tin nhắn đầu tiên (recipientId, không có
   * conversationId) hoặc gửi tiếp vào 1 conversation đã tồn tại (conversationId).
   * KHÔNG được gửi cả 2 rỗng — BE validate qua @ValidSendMessageTarget.
   */
  sendMessage: async (
    request: SendMessageRequest,
  ): Promise<MessageResponse> => {
    try {
      const res = await axiosClient.post<ApiResponse<MessageResponse>>(
        MESSAGE_ENDPOINTS.SEND_MESSAGE,
        request,
      );
      const data = res.data;
      if (!data || data.code !== CODE.SEND_MESSAGE || !data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to send message"),
        );
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to send message"));
    }
  },

  /**
   * POST /v1/chat/messages/media (multipart/form-data, field "files") —
   * upload file lấy url thật trên object storage TRƯỚC khi gọi sendMessage
   * với media[].url tương ứng (BE không nhận blob:/data: URL). Dùng chung 1
   * lần gọi cho nhiều file, khớp @Size(max = 10) của SendMessageRequest.media
   * và giới hạn "files.size() > 10" ở ChatService.uploadMessageMedia().
   *
   * BUG ĐÃ SỬA: axiosClient có timeout mặc định 15000ms (hợp lý cho API
   * JSON thường), nhưng áp cả vào request này thì video (hoặc nhiều ảnh
   * dung lượng lớn) chỉ cần lâu hơn 15s là bị axios tự abort giữa chừng —
   * server nhận ClientAbortException/EOFException lúc đang parse multipart
   * (đúng log BE, cách nhau ~15s), còn FE thì hiện lỗi "timeout of 15000ms
   * exceeded" tưởng là BE chậm/treo trong khi thực ra do chính FE cắt kết
   * nối. Override timeout dài hơn hẳn RIÊNG cho request upload này (không
   * đổi timeout mặc định của các API khác) — 25MB tối đa mỗi file (khớp
   * app.chat.media.max-size-bytes ở BE) trên mạng chậm vẫn cần vài chục giây.
   */
  uploadMessageMedia: async (
    files: File[],
    onProgress?: (percent: number) => void,
  ): Promise<MediaUploadResponse[]> => {
    if (files.length === 0) return [];
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const res = await axiosClient.post<ApiResponse<MediaUploadResponse[]>>(
        MESSAGE_ENDPOINTS.UPLOAD_MESSAGE_MEDIA,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120_000, // 2 phút — đủ cho upload nhiều file/video trên mạng chậm
          // Cả batch file gửi trong 1 request multipart DUY NHẤT, nên progress
          // ở đây là % TỔNG DUNG LƯỢNG đã gửi của request, không tách được
          // theo từng file riêng lẻ — đủ dùng để hiện 1 thanh progress chung
          // (đặc biệt cần cho video, dung lượng lớn hơn hẳn ảnh nên lâu hơn nhiều).
          onUploadProgress: onProgress
            ? (evt) => {
                if (!evt.total) return;
                onProgress(Math.round((evt.loaded / evt.total) * 100));
              }
            : undefined,
        },
      );
      const data = res.data;
      if (!data || data.code !== CODE.UPLOAD_MESSAGE_MEDIA || !data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to upload media"),
        );
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to upload media"));
    }
  },

  /** PUT /v1/chat/{conversationId}/read?lastMessageId=... */
  markAsRead: async (
    conversationId: string,
    lastMessageId: string,
  ): Promise<void> => {
    try {
      const res = await axiosClient.put<ApiResponse<void>>(
        MESSAGE_ENDPOINTS.MARK_AS_READ(conversationId),
        null,
        { params: { lastMessageId } },
      );
      const data = res.data;
      if (!data || data.code !== CODE.MARK_AS_READ) {
        throw new Error(
          getErrorMessage(data.message, "Failed to mark as read"),
        );
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to mark as read"));
    }
  },

  /** GET /v1/messages/{conversationId}/messages?cursor&limit */
  getMessages: async (
    conversationId: string,
    cursor?: string,
    size = 20,
  ): Promise<CursorResponse<MessageResponse>> => {
    try {
      const res = await axiosClient.get<
        ApiResponse<CursorResponse<MessageResponse>>
      >(MESSAGE_ENDPOINTS.MESSAGES(conversationId), {
        params: { size, ...(cursor ? { cursor } : {}) },
      });
      const data = res.data;
      if (!data || data.code !== CODE.GET_MESSAGES || !data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to fetch messages"),
        );
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
