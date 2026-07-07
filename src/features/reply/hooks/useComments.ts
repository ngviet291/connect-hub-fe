import { useCallback, useEffect, useState } from 'react';
import { commentApi } from '../api/commentApi';
import type { CommentItem } from '../types/comment.types';

export const useComments = (postId: string | undefined) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setIsLoading(true);
    setError(false);
    try {
      const data = await commentApi.getComments(postId);
      setComments(data);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string) => {
    if (!postId || !content.trim()) return;
    const comment = await commentApi.createComment({ postId, content });
    setComments((prev) => [...prev, comment]);
    return comment;
  };

  const toggleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, isLiked: !c.isLiked, likeCount: c.likeCount + (c.isLiked ? -1 : 1) } : c))
    );
    commentApi.likeComment(commentId);
  };

  return { comments, isLoading, error, addComment, toggleLike, refetch: fetchComments };
};
