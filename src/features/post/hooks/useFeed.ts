import { useCallback, useEffect, useState } from 'react';
import { postApi } from '../api/postApi';
import type { Post } from '../types/post.types';
import { usePostActions } from './usePostActions';

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasNext, setHasNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchFeed = useCallback(
    async (reset = false) => {
      setIsLoading(true);
      setError(false);
      try {
        const res = await postApi.getFeed(reset ? undefined : cursor);
        setPosts((prev) => (reset ? res.content : [...prev, ...res.content]));
        setCursor(res.nextCursor ?? undefined);
        setHasNext(res.hasNext);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [cursor]
  );

  useEffect(() => {
    fetchFeed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = usePostActions(setPosts);

  const prependPost = (post: Post) => setPosts((prev) => [post, ...prev]);

  return {
    posts,
    isLoading,
    error,
    hasNext,
    loadMore: () => fetchFeed(),
    refresh: () => fetchFeed(true),
    prependPost,
    ...actions,
  };
};
