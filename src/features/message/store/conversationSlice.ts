import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../app/store";
import type { ConversationSummaryResponse } from "../types/message.types";

// Một nguồn state DUY NHẤT cho danh sách hội thoại (Redux) — Sidebar,
// BottomNav và trang Messages đều đọc/ghi qua slice này, không tạo thêm
// Context/state riêng nào khác cho cùng loại dữ liệu (xem guide.md mục 5).
interface ConversationState {
  conversations: ConversationSummaryResponse[];
  nextCursor: string | null;
  hasNext: boolean;
  isLoading: boolean;
  hasFetched: boolean;
}

const initialState: ConversationState = {
  conversations: [],
  nextCursor: null,
  hasNext: false,
  isLoading: true,
  hasFetched: false,
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
  },
});

export const {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  markConversationRead,
  upsertLastMessage,
} = conversationSlice.actions;

export const selectConversations = (s: RootState) => s.conversation.conversations;
export const selectConversationsLoading = (s: RootState) => s.conversation.isLoading;
export const selectConversationsHasNext = (s: RootState) => s.conversation.hasNext;
export const selectConversationsNextCursor = (s: RootState) => s.conversation.nextCursor;
export const selectTotalUnreadConversations = (s: RootState) =>
  s.conversation.conversations.reduce((sum, c) => sum + c.unreadCount, 0);

export default conversationSlice.reducer;
