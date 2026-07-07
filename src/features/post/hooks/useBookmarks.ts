import { useCallback, useEffect, useState } from 'react';
import { postApi } from '../api/postApi';
import type { Post } from '../types/post.types';
import { usePostActions } from './usePostActions';

export const useBookmarks = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      setPosts(await postApi.getBookmarks());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const actions = usePostActions(setPosts);

  return { posts, isLoading, refetch: fetch, ...actions };
};
