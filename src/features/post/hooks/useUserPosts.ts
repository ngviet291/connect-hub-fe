import { useCallback, useEffect, useState } from 'react';
import { postApi } from '../api/postApi';
import type { Post } from '../types/post.types';
import { usePostActions } from './usePostActions';

export const useUserPosts = (username: string | undefined) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetch = useCallback(async () => {
    if (!username) return;
    setIsLoading(true);
    setError(false);
    try {
      setPosts(await postApi.getUserPosts(username));
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const actions = usePostActions(setPosts);

  return { posts, isLoading, error, refetch: fetch, ...actions };
};
