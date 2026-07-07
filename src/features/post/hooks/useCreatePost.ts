import { useState } from 'react';
import { postApi } from '../api/postApi';
import type { Post } from '../types/post.types';

export const useCreatePost = (onSuccess?: (post: Post) => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const createPost = async (content: string) => {
    if (!content.trim()) return;
    setIsLoading(true);
    try {
      const post = await postApi.createPost({ content });
      onSuccess?.(post);
    } finally {
      setIsLoading(false);
    }
  };

  return { createPost, isLoading };
};
