import { getErrorMessage } from "@/constants/errorMessage";
import axiosClient from "../../../config/axiosClient";
import type {
  ApiResponse,
  CursorResponse,
} from "../../../shared/types/api.types";
import type {
  AcceptConversationRequest,
  AddMembersRequest,
  ConversationDetailResponse,
  ConversationExistsResponse,
  ConversationSummaryResponse,
  CreateGroupConversationRequest,
  MemberStatus,
  UpdateConversationRequest,
  UpdateMemberRoleRequest,
} from "../types/message.types";
import { MESSAGE_ENDPOINTS } from "../utils/MessageEndpoint";

// Mã code trả về đúng theo ChatResponseCode.java (BE) cho từng action —
// không dùng chung 1 mã cho nhiều action khác nhau (xem guide.md 2.3).
const CODE = {
  GET_CONVERSATIONS: 200,
  GET_CONVERSATION_DETAIL: 200,
  ACCEPT_CONVERSATION_REQUEST: 200,
  CREATE_CONVERSATION: 201,
  UPDATE_CONVERSATION: 200,
  ADD_MEMBER: 200,
  CHECK_PRIVATE_CONVERSATION_EXISTS: 200,
} as const;

export const conversationService = {
  /** GET /v1/conversations?cursor&size&status */
  getConversations: async (
    status?: MemberStatus,
    cursor?: string,
    size = 20,
  ): Promise<CursorResponse<ConversationSummaryResponse>> => {
    try {
      const res = await axiosClient.get<
        ApiResponse<CursorResponse<ConversationSummaryResponse>>
      >(MESSAGE_ENDPOINTS.CONVERSATIONS, {
        params: {
          size,
          ...(status ? { status } : {}),
          ...(cursor ? { cursor } : {}),
        },
      });
      const data = res.data;
      if (!data || data.code !== CODE.GET_CONVERSATIONS || !data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to fetch conversations"),
        );
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to fetch conversations"));
    }
  },

  /** GET /v1/conversations/{id}?cursor&size — cursor/size ở đây phân trang cho danh sách MEMBER, không phải message */
  getConversationDetail: async (
    conversationId: string,
    cursor?: string,
    size = 20,
  ): Promise<ConversationDetailResponse> => {
    try {
      const res = await axiosClient.get<
        ApiResponse<ConversationDetailResponse>
      >(MESSAGE_ENDPOINTS.CONVERSATION_DETAIL(conversationId), {
        params: { size, ...(cursor ? { cursor } : {}) },
      });
      const data = res.data;
      if (!data || data.code !== CODE.GET_CONVERSATION_DETAIL || !data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to fetch conversation detail"),
        );
      }
      return data.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Failed to fetch conversation detail"),
      );
    }
  },

  /**
   * PATCH /v1/conversations/accept — chấp nhận 1 conversation PRIVATE đang PENDING.
   * userAccept lấy từ useAuth().user.id (BE không tự suy currentUser cho field này).
   */
  acceptConversation: async (
    request: AcceptConversationRequest,
  ): Promise<void> => {
    try {
      const res = await axiosClient.patch<ApiResponse<void>>(
        MESSAGE_ENDPOINTS.CONVERSATION_ACCEPT,
        request,
      );
      const data = res.data;
      if (!data || data.code !== CODE.ACCEPT_CONVERSATION_REQUEST) {
        throw new Error(
          getErrorMessage(data.message, "Failed to accept conversation"),
        );
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to accept conversation"));
    }
  },

  /** POST /v1/conversations/group — name optional, members tối thiểu 2 phần tử */
  createGroupConversation: async (
    request: CreateGroupConversationRequest,
  ): Promise<ConversationSummaryResponse> => {
    try {
      const res = await axiosClient.post<
        ApiResponse<ConversationSummaryResponse>
      >(MESSAGE_ENDPOINTS.CONVERSATION_GROUP, request);
      const data = res.data;
      if (!data || data.code !== CODE.CREATE_CONVERSATION || !data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to create group"),
        );
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to create group"));
    }
  },

  /**
   * PATCH /v1/conversations/{id}/leave — controller trả void thô (không bọc
   * ApiResponse), nên không có data.code để check, chỉ cần request không throw.
   */
  leaveConversation: async (conversationId: string): Promise<void> => {
    try {
      await axiosClient.patch(
        MESSAGE_ENDPOINTS.CONVERSATION_LEAVE(conversationId),
      );
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to leave conversation"));
    }
  },

  /** PATCH /v1/conversations/{id}/members/{memberId}/remove — cũng trả void thô */
  removeMember: async (
    conversationId: string,
    memberId: string,
  ): Promise<void> => {
    try {
      await axiosClient.patch(
        MESSAGE_ENDPOINTS.CONVERSATION_MEMBER_REMOVE(conversationId, memberId),
      );
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to remove member"));
    }
  },

  /**
   * PATCH /v1/conversations/{id} — BE nhận @ModelAttribute (multipart/form-data),
   * KHÔNG phải JSON, dù không có file avatar cũng phải gửi dạng form.
   */
  updateConversation: async (
    conversationId: string,
    request: UpdateConversationRequest,
  ): Promise<ConversationSummaryResponse> => {
    try {
      const form = new FormData();
      if (request.name !== undefined) form.append("name", request.name);
      if (request.avatar) form.append("avatar", request.avatar);

      const res = await axiosClient.patch<
        ApiResponse<ConversationSummaryResponse>
      >(MESSAGE_ENDPOINTS.CONVERSATION_DETAIL(conversationId), form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data;
      if (!data || data.code !== CODE.UPDATE_CONVERSATION || !data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to update conversation"),
        );
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to update conversation"));
    }
  },

  /** POST /v1/conversations/{id}/members */
  addMembers: async (
    conversationId: string,
    request: AddMembersRequest,
  ): Promise<ConversationDetailResponse> => {
    try {
      const res = await axiosClient.post<
        ApiResponse<ConversationDetailResponse>
      >(MESSAGE_ENDPOINTS.CONVERSATION_MEMBERS(conversationId), request);
      const data = res.data;
      if (!data || data.code !== CODE.ADD_MEMBER || !data.data) {
        throw new Error(getErrorMessage(data.message, "Failed to add members"));
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to add members"));
    }
  },

  /** GET /v1/conversations/private/{peerId}/exists — trả conversationId nếu đã có, null nếu chưa */
  checkPrivateConversationExists: async (
    peerId: string,
  ): Promise<string | null> => {
    try {
      const res = await axiosClient.get<
        ApiResponse<ConversationExistsResponse>
      >(MESSAGE_ENDPOINTS.CONVERSATION_PRIVATE_EXISTS(peerId));
      const data = res.data;
      if (!data || data.code !== CODE.CHECK_PRIVATE_CONVERSATION_EXISTS) {
        throw new Error(
          getErrorMessage(data.message, "Failed to check conversation"),
        );
      }
      return data.data.conversationId;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to check conversation"));
    }
  },

  /** PATCH /v1/conversations/{id}/members/{memberId}/status */
  updateMemberRole: async (
    conversationId: string,
    memberId: string,
    request: UpdateMemberRoleRequest,
  ): Promise<ConversationDetailResponse> => {
    try {
      const res = await axiosClient.patch<
        ApiResponse<ConversationDetailResponse>
      >(
        MESSAGE_ENDPOINTS.CONVERSATION_MEMBER_STATUS(conversationId, memberId),
        request,
      );
      const data = res.data;
      // BE dùng lại UPDATE_CONVERSATION_SUCCESS (200) cho action này — xem
      // ConversationController.updateMemberRole, không phải nhầm lẫn ở FE.
      if (!data || data.code !== CODE.UPDATE_CONVERSATION || !data.data) {
        throw new Error(
          getErrorMessage(data.message, "Failed to update member role"),
        );
      }
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to update member role"));
    }
  },
};
