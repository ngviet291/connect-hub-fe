import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type { Conversation } from '../types/message.types';

interface ConversationState {
  conversations: Conversation[];
  isLoading: boolean;
  hasFetched: boolean;
}

const initialState: ConversationState = {
  conversations: [],
  isLoading: true,
  hasFetched: false,
};

export const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    fetchStart(state) {
      state.isLoading = true;
      state.hasFetched = true;
    },
    fetchSuccess(state, { payload }: PayloadAction<Conversation[]>) {
      state.conversations = payload;
      state.isLoading = false;
    },
    fetchFailure(state) {
      state.isLoading = false;
    },
    markConversationRead(state, { payload: conversationId }: PayloadAction<string>) {
      const c = state.conversations.find((x) => x.id === conversationId);
      if (c) c.unreadCount = 0;
    },
  },
});

export const { fetchStart, fetchSuccess, fetchFailure, markConversationRead } =
  conversationSlice.actions;

export const selectConversations = (s: RootState) => s.conversation.conversations;
export const selectConversationsLoading = (s: RootState) => s.conversation.isLoading;
export const selectTotalUnreadConversations = (s: RootState) =>
  s.conversation.conversations.reduce((sum, c) => sum + c.unreadCount, 0);

export default conversationSlice.reducer;
