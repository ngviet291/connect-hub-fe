import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { store, type AppDispatch } from "../../../app/store";
import { conversationService } from "../service/conversationService";
import { messageService } from "../service/messageService";
import type { MemberStatus } from "../types/message.types";
import {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  markConversationRead as markConversationReadAction,
  setActiveConversation as setActiveConversationAction,
  selectConversations,
  selectConversationsLoading,
  selectConversationsHasNext,
  selectConversationsNextCursor,
  selectTotalUnreadConversations,
} from "../store/conversationSlice";

/**
 * Dùng chung 1 nguồn state (Redux store) để Sidebar, BottomNav và trang
 * Messages luôn đồng bộ số tin chưa đọc (guide.md mục 5 — one source of truth).
 */
export const useConversations = (status?: MemberStatus) => {
  const dispatch = useDispatch<AppDispatch>();
  const conversations = useSelector(selectConversations);
  const isLoading = useSelector(selectConversationsLoading);
  const hasNext = useSelector(selectConversationsHasNext);
  const nextCursor = useSelector(selectConversationsNextCursor);
  const totalUnread = useSelector(selectTotalUnreadConversations);
  const isLoadingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const setActiveConversation = useCallback(
    (conversationId: string | null) => dispatch(setActiveConversationAction(conversationId)),
    [dispatch],
  );

  const refetch = useCallback(async () => {
    isLoadingRef.current = true;
    dispatch(fetchStart());
    try {
      const data = await conversationService.getConversations(status);
      dispatch(
        fetchSuccess({
          content: data.content,
          nextCursor: data.nextCursor,
          hasNext: data.hasNext,
          reset: true,
        }),
      );
      setError(null);
    } catch (e) {
      dispatch(fetchFailure());
      setError(e instanceof Error ? e.message : "Failed to fetch conversations");
    } finally {
      isLoadingRef.current = false;
    }
  }, [dispatch, status]);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasNext || !nextCursor) return;
    isLoadingRef.current = true;
    try {
      const data = await conversationService.getConversations(status, nextCursor);
      dispatch(
        fetchSuccess({
          content: data.content,
          nextCursor: data.nextCursor,
          hasNext: data.hasNext,
          reset: false,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch conversations");
    } finally {
      isLoadingRef.current = false;
    }
  }, [dispatch, status, hasNext, nextCursor]);

  useEffect(() => {
    // Đọc trực tiếp từ store (không qua closure của lần render) để nhiều
    // component cùng mount vẫn chỉ fetch đúng 1 lần.
    if (!store.getState().conversation.hasFetched) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Đánh dấu đã đọc — cần lastMessageId vì BE dùng nó làm con trỏ
   * (PUT /v1/chat/{conversationId}/read?lastMessageId=...). Optimistic
   * update trước; không rollback vì đây gần như không thể lỗi về UX,
   * chỉ best-effort — unreadCount tự đúng lại ở lần refetch sau nếu fail.
   */
  const markConversationRead = useCallback(
    (conversationId: string, lastMessageId: string) => {
      dispatch(markConversationReadAction(conversationId));
      messageService.markAsRead(conversationId, lastMessageId).catch(() => {});
    },
    [dispatch],
  );

  return {
    conversations,
    isLoading,
    hasNext,
    error,
    totalUnread,
    markConversationRead,
    setActiveConversation,
    refetch,
    loadMore,
  };
};
