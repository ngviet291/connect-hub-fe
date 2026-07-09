import { useCallback, useEffect, useState } from 'react';
import { replyApi } from '../api/replyApi';
import type { ReplyItem } from '../types/reply.types';

export const useReplies = (postId: string | undefined) => {
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchReplies = useCallback(async () => {
    if (!postId) return;

    setIsLoading(true);
    setError(false);

    try {
      const data = await replyApi.getReplies(postId);
      setReplies(data);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  const addReply = async (content: string) => {
    if (!postId || !content.trim()) return;

    const reply = await replyApi.createReply({
      postId,
      content,
    });

    setReplies((prev) => [...prev, reply]);

    return reply;
  };

  const toggleLike = (replyId: string) => {
    setReplies((prev) =>
      prev.map((r) =>
        r.id === replyId
          ? {
              ...r,
              isLiked: !r.isLiked,
              likeCount: r.likeCount + (r.isLiked ? -1 : 1),
            }
          : r,
      ),
    );

    replyApi.likeReply(replyId);
  };

  return {
    replies,
    isLoading,
    error,
    addReply,
    toggleLike,
    refetch: fetchReplies,
  };
};