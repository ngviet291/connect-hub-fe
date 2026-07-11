import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store, type AppDispatch } from '../../../app/store';
import { messageApi } from '../api/messageApi';
import {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  markConversationRead as markConversationReadAction,
  selectConversations,
  selectConversationsLoading,
  selectTotalUnreadConversations,
} from '../store/conversationSlice';

// Dùng chung 1 nguồn state (Redux store) để sidebar, bottom nav và trang tin nhắn
// luôn đồng bộ số tin chưa đọc.
export const useConversations = () => {
  const dispatch = useDispatch<AppDispatch>();
  const conversations = useSelector(selectConversations);
  const isLoading = useSelector(selectConversationsLoading);
  const totalUnread = useSelector(selectTotalUnreadConversations);

  const refetch = useCallback(async () => {
    dispatch(fetchStart());
    try {
      const data = await messageApi.getConversations();
      dispatch(fetchSuccess(data));
    } catch {
      dispatch(fetchFailure());
    }
  }, [dispatch]);

  useEffect(() => {
    // Đọc trực tiếp từ store (không qua closure của lần render) để nhiều component
    // cùng mount vẫn chỉ fetch đúng 1 lần.
    if (!store.getState().conversation.hasFetched) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markConversationRead = useCallback(
    (conversationId: string) => {
      dispatch(markConversationReadAction(conversationId));
      messageApi.markAsRead(conversationId);
    },
    [dispatch],
  );

  return { conversations, isLoading, totalUnread, markConversationRead, refetch };
};
