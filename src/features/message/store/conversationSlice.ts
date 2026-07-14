import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../app/store";
import type {
  ConversationSummaryResponse,
  ConversationType,
  MemberStatus,
} from "../types/message.types";

// Một nguồn state DUY NHẤT cho danh sách hội thoại (Redux) — Sidebar,
// BottomNav và trang Messages đều đọc/ghi qua slice này, không tạo thêm
// Context/state riêng nào khác cho cùng loại dữ liệu (xem guide.md mục 5).
interface ConversationState {
  conversations: ConversationSummaryResponse[];
  nextCursor: string | null;
  hasNext: boolean;
  isLoading: boolean;
  hasFetched: boolean;
  /** conversationId đang được mở trên màn hình (ChatPage) — dùng để realtime
   *  biết có nên tăng unreadCount hay không (đang xem thì không tăng). */
  activeConversationId: string | null;
}

const initialState: ConversationState = {
  conversations: [],
  nextCursor: null,
  hasNext: false,
  isLoading: true,
  hasFetched: false,
  activeConversationId: null,
};

interface FetchSuccessPayload {
  content: ConversationSummaryResponse[];
  nextCursor: string | null;
  hasNext: boolean;
  /** true = reset danh sách (lần load đầu/refetch), false = nối thêm (load more) */
  reset: boolean;
}

export const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    fetchStart(state) {
      state.isLoading = true;
      state.hasFetched = true;
    },
    fetchSuccess(state, { payload }: PayloadAction<FetchSuccessPayload>) {
      state.conversations = payload.reset
        ? payload.content
        : [...state.conversations, ...payload.content];
      state.nextCursor = payload.nextCursor;
      state.hasNext = payload.hasNext;
      state.isLoading = false;
    },
    fetchFailure(state) {
      state.isLoading = false;
    },
    markConversationRead(state, { payload: conversationId }: PayloadAction<string>) {
      const c = state.conversations.find((x) => x.conversationId === conversationId);
      if (c) c.unreadCount = 0;
    },
    /** Cập nhật preview khi có tin nhắn mới tới qua WebSocket, và đẩy hội thoại đó lên đầu danh sách */
    upsertLastMessage(
      state,
      {
        payload,
      }: PayloadAction<{
        conversationId: string;
        lastMessageId: string;
        lastMessageContent: string;
        lastMessageSenderUsername: string;
        lastMessageAt: string;
        incrementUnread: boolean;
      }>,
    ) {
      const existing = state.conversations.find((c) => c.conversationId === payload.conversationId);
      if (!existing) return; // hội thoại mới toanh — để lần refetch tiếp theo lấy về, tránh thiếu field
      existing.lastMessageId = payload.lastMessageId;
      existing.lastMessageContent = payload.lastMessageContent;
      existing.lastMessageSenderUsername = payload.lastMessageSenderUsername;
      existing.lastMessageAt = payload.lastMessageAt;
      if (payload.incrementUnread) existing.unreadCount += 1;
      state.conversations = [
        existing,
        ...state.conversations.filter((c) => c.conversationId !== payload.conversationId),
      ];
    },
    /**
     * Bản tổng quát của upsertLastMessage — nếu conversation đã có trong danh
     * sách thì chỉ update preview + đẩy lên đầu (giữ nguyên displayName/avatar/type
     * thật đã có từ BE); nếu CHƯA có (tin nhắn PRIVATE đầu tiên từ 1 người lạ, hoặc
     * pending request) thì tự dựng 1 summary tạm từ chính event realtime để hiện
     * ngay lên sidebar, không phải đợi F5/refetch mới thấy hội thoại mới.
     */
    upsertConversationSummary(
      state,
      {
        payload,
      }: PayloadAction<{
        conversationId: string;
        type: ConversationType;
        displayName: string;
        displayAvatarUrl?: string;
        myStatus: MemberStatus;
        peerId?: string;
        lastMessageId: string;
        lastMessageContent: string;
        lastMessageSenderUsername: string;
        lastMessageAt: string;
        incrementUnread: boolean;
      }>,
    ) {
      const existing = state.conversations.find((c) => c.conversationId === payload.conversationId);
      if (existing) {
        existing.lastMessageId = payload.lastMessageId;
        existing.lastMessageContent = payload.lastMessageContent;
        existing.lastMessageSenderUsername = payload.lastMessageSenderUsername;
        existing.lastMessageAt = payload.lastMessageAt;
        // Người lạ vừa accept lời mời (PENDING -> ACCEPTED) qua thiết bị khác — đồng bộ lại.
        existing.myStatus = payload.myStatus;
        if (payload.incrementUnread) existing.unreadCount += 1;
        state.conversations = [
          existing,
          ...state.conversations.filter((c) => c.conversationId !== payload.conversationId),
        ];
        return;
      }
      const created: ConversationSummaryResponse = {
        conversationId: payload.conversationId,
        type: payload.type,
        displayName: payload.displayName,
        displayAvatarUrl: payload.displayAvatarUrl,
        myStatus: payload.myStatus,
        peerId: payload.peerId,
        lastMessageId: payload.lastMessageId,
        lastMessageContent: payload.lastMessageContent,
        lastMessageSenderUsername: payload.lastMessageSenderUsername,
        lastMessageAt: payload.lastMessageAt,
        unreadCount: payload.incrementUnread ? 1 : 0,
      };
      state.conversations = [created, ...state.conversations];
    },
    /** ChatPage set/clear conversation đang mở — dùng để bỏ qua tăng unread khi đang xem trực tiếp. */
    setActiveConversation(state, { payload }: PayloadAction<string | null>) {
      state.activeConversationId = payload;
    },
  },
});

export const {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  markConversationRead,
  upsertLastMessage,
  upsertConversationSummary,
  setActiveConversation,
} = conversationSlice.actions;

export const selectConversations = (s: RootState) => s.conversation.conversations;
export const selectConversationsLoading = (s: RootState) => s.conversation.isLoading;
export const selectConversationsHasNext = (s: RootState) => s.conversation.hasNext;
export const selectConversationsNextCursor = (s: RootState) => s.conversation.nextCursor;
export const selectActiveConversationId = (s: RootState) => s.conversation.activeConversationId;
export const selectTotalUnreadConversations = (s: RootState) =>
  s.conversation.conversations.reduce((sum, c) => sum + c.unreadCount, 0);

export default conversationSlice.reducer;
