import { getErrorMessage } from "@/constants/errorMessage";
import axiosClient from "../../../config/axiosClient";
import type {
  ApiResponse,
  CursorResponse,
} from "../../../shared/types/api.types";
import type {
  Conversation,
  ConversationStatus,
  MemberRole,
} from "../types/conversation.type";
import { MESSAGE_ENDPOINTS } from "../utils/MessageEndpoint";

const mapConversation = (raw: any): Conversation => ({
  ...raw,
  id: raw.id ?? raw.conversationId,
});

export const conversationService = {
  getConversations: async (
    status?: ConversationStatus,
    cursor?: string,
    size = 20,
  ): Promise<CursorResponse<Conversation>> => {
    try {
      const res = await axiosClient.get<
        ApiResponse<CursorResponse<Conversation>>
      >(MESSAGE_ENDPOINTS.CONVERSATIONS, {
        params: {
          size,
          ...(status ? { status } : {}),
          ...(cursor ? { cursor } : {}),
        },
      });

      const data = res.data;
      if (!data || data.code !== 200 || !data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to fetch conversations"),
        );
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to fetch conversations"));
    }
  },

  //   getConversationDetail: async (
  //     conversationId: string,
  //   ): Promise<Conversation> => {
  //     const res = await axiosClient.get<ApiResponse<any>>(
  //       MESSAGE_ENDPOINTS.CONVERSATION_BY_ID(conversationId),
  //     );
  //     return mapConversation(res.data.data);
  //   },

  //   /**
  //    * Chấp nhận 1 conversation PRIVATE đang ở trạng thái PENDING (chưa mutual-follow).
  //    * currentUserId lấy từ useAuth().user.id — Redux "auth" slice không lưu id nên không tự đọc ở đây được.
  //    */
  //   acceptConversation: async (
  //     conversationId: string,
  //     currentUserId: string,
  //   ): Promise<void> => {
  //     await axiosClient.patch(API_ENDPOINTS.CONVERSATION_ACCEPT, {
  //       conversationId,
  //       userAccept: currentUserId,
  //     });
  //   },

  //   markAsRead: async (
  //     conversationId: string,
  //     lastMessageId: string,
  //   ): Promise<void> => {
  //     await axiosClient.put(
  //       API_ENDPOINTS.CONVERSATION_READ(conversationId),
  //       null,
  //       {
  //         params: { lastMessageId },
  //       },
  //     );
  //   },

  //   leaveConversation: async (conversationId: string): Promise<void> => {
  //     await axiosClient.patch(API_ENDPOINTS.CONVERSATION_LEAVE(conversationId));
  //   },

  //   /** Đổi tên/avatar group — multipart vì có thể kèm file ảnh */
  //   updateConversation: async (
  //     conversationId: string,
  //     data: { name?: string; avatarFile?: File },
  //   ): Promise<Conversation> => {
  //     const form = new FormData();
  //     if (data.name) form.append("name", data.name);
  //     if (data.avatarFile) form.append("avatar", data.avatarFile);
  //     const res = await axiosClient.patch<ApiResponse<any>>(
  //       API_ENDPOINTS.CONVERSATION_BY_ID(conversationId),
  //       form,
  //       {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       },
  //     );
  //     return mapConversation(res.data.data);
  //   },

  //   createGroup: async (
  //     name: string,
  //     memberIds: string[],
  //   ): Promise<Conversation> => {
  //     const res = await axiosClient.post<ApiResponse<any>>(
  //       API_ENDPOINTS.CONVERSATION_GROUP,
  //       {
  //         name,
  //         members: memberIds,
  //       },
  //     );
  //     return mapConversation(res.data.data);
  //   },

  //   addMembers: async (
  //     conversationId: string,
  //     memberIds: string[],
  //   ): Promise<void> => {
  //     await axiosClient.post(API_ENDPOINTS.CONVERSATION_MEMBERS(conversationId), {
  //       memberIds,
  //     });
  //   },

  //   kickMember: async (
  //     conversationId: string,
  //     memberId: string,
  //   ): Promise<void> => {
  //     await axiosClient.patch(
  //       API_ENDPOINTS.CONVERSATION_MEMBER_REMOVE(conversationId, memberId),
  //     );
  //   },

  //   updateMemberRole: async (
  //     conversationId: string,
  //     memberId: string,
  //     role: MemberRole,
  //   ): Promise<void> => {
  //     await axiosClient.patch(
  //       API_ENDPOINTS.CONVERSATION_MEMBER_STATUS(conversationId, memberId),
  //       { role },
  //     );
  //   },
};
