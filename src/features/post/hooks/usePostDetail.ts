import { useCallback, useEffect, useState } from 'react';
import { postApi } from '../api/postApi';
import type { Post } from '../types/post.types';

export const usePostDetail = (postId: string | undefined) => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetch = useCallback(async () => {
    if (!postId) return;
    setIsLoading(true);
    setError(false);
    try {
      setPost(await postApi.getPost(postId));
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const toggleLike = () => {
    if (!post) return;
    const isLiked = post.isLiked;
    isLiked ? postApi.unlikePost(post.id) : postApi.likePost(post.id);
    setPost({ ...post, isLiked: !isLiked, likeCount: post.likeCount + (isLiked ? -1 : 1) });
  };

  const toggleBookmark = () => {
    if (!post) return;
    const isBookmarked = post.isBookmarked;
    isBookmarked ? postApi.unbookmark(post.id) : postApi.bookmark(post.id);
    setPost({ ...post, isBookmarked: !isBookmarked });
  };

  const toggleRepost = () => {
    if (!post) return;
    const isReposted = post.isReposted;
    isReposted ? postApi.unrepost(post.id) : postApi.repost(post.id);
    setPost({ ...post, isReposted: !isReposted, repostCount: post.repostCount + (isReposted ? -1 : 1) });
  };

  return { post, isLoading, error, toggleLike, toggleBookmark, toggleRepost, refetch: fetch };
};
