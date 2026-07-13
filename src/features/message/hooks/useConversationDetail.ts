import { useCallback, useEffect, useState } from "react";
import { conversationService } from "../service/conversationService";
import type { ConversationDetailResponse } from "../types/message.types";

/**
 * GET /v1/conversations/{id} — dùng cho header trang chat (tên/avatar hiển
 * thị, và với PRIVATE thì tìm username của đối phương trong `members` để
 * điều hướng sang trang profile).
 */
export function useConversationDetail(conversationId: string | undefined) {
  const [detail, setDetail] = useState<ConversationDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!conversationId) {
      setDetail(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data =
        await conversationService.getConversationDetail(conversationId);
      setDetail(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch conversation");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { detail, isLoading, error, refetch: fetchDetail };
}
