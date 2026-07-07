import { useCallback } from 'react';
import { postApi } from '../api/postApi';
import type { Post } from '../types/post.types';

type Updater = (updater: (posts: Post[]) => Post[]) => void;

export const usePostActions = (setPosts: Updater) => {
  const toggleLike = useCallback(
    (postId: string, isLiked: boolean) => {
      isLiked ? postApi.unlikePost(postId) : postApi.likePost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isLiked: !isLiked, likeCount: p.likeCount + (isLiked ? -1 : 1) } : p))
      );
    },
    [setPosts]
  );

  const toggleRepost = useCallback(
    (postId: string, isReposted: boolean) => {
      isReposted ? postApi.unrepost(postId) : postApi.repost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isReposted: !isReposted, repostCount: p.repostCount + (isReposted ? -1 : 1) } : p
        )
      );
    },
    [setPosts]
  );

  const toggleBookmark = useCallback(
    (postId: string, isBookmarked: boolean) => {
      isBookmarked ? postApi.unbookmark(postId) : postApi.bookmark(postId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isBookmarked: !isBookmarked } : p)));
    },
    [setPosts]
  );

  const removePost = useCallback(
    (postId: string) => {
      postApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    },
    [setPosts]
  );

  return { toggleLike, toggleRepost, toggleBookmark, removePost };
};
