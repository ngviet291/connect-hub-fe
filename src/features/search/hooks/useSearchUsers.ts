import { useCallback, useEffect, useRef, useState } from "react";
import { followService } from "@/features/follow";
import { searchService } from "../service/searchService";
import type { HashtagSearchResponse, UserSearchResponse } from "../types/search.types";
import type { Post } from "@/features/post/types/post.types";

export function useSearchUsers(keyword: string | undefined) {
  const [users, setUsers] = useState<UserSearchResponse[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtags, setHashtags] = useState<HashtagSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoadingRef = useRef(false);

  const fetchAll = useCallback(async () => {
    const trimmedKeyword = keyword?.trim();
    if (!trimmedKeyword || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    const expectedKeyword = trimmedKeyword;

    const [usersResult, postsResult, hashtagsResult] = await Promise.allSettled([
      searchService.searchUsers(trimmedKeyword),
      searchService.searchPosts(trimmedKeyword),
      searchService.searchHashtags(trimmedKeyword),
    ]);

    if (expectedKeyword !== keyword?.trim()) {
      isLoadingRef.current = false;
      setIsLoading(false);
      return;
    }

    let nextError: string | null = null;

    if (usersResult.status === "fulfilled") {
      setUsers(usersResult.value.content);
    } else {
      const message =
        usersResult.reason instanceof Error
          ? usersResult.reason.message
          : String(usersResult.reason);
      nextError = nextError ? `${nextError}; ${message}` : message;
    }

    if (postsResult.status === "fulfilled") {
      setPosts(postsResult.value.content);
    } else {
      const message =
        postsResult.reason instanceof Error
          ? postsResult.reason.message
          : String(postsResult.reason);
      nextError = nextError ? `${nextError}; ${message}` : message;
    }

    if (hashtagsResult.status === "fulfilled") {
      setHashtags(hashtagsResult.value.content);
    } else {
      const message =
        hashtagsResult.reason instanceof Error
          ? hashtagsResult.reason.message
          : String(hashtagsResult.reason);
      nextError = nextError ? `${nextError}; ${message}` : message;
    }

    if (nextError) {
      setError(nextError);
    }

    isLoadingRef.current = false;
    setIsLoading(false);
  }, [keyword]);

  useEffect(() => {
    const trimmedKeyword = keyword?.trim();
    if (!trimmedKeyword) {
      setUsers([]);
      setPosts([]);
      setHashtags([]);
      setError(null);
      return;
    }

    fetchAll();
  }, [fetchAll, keyword]);

  const toggleFollow = useCallback(async (user: UserSearchResponse) => {
    const next = !user.isFollowing;

    setUsers((prev) =>
      prev.map((item) =>
        item.id === user.id ? { ...item, isFollowing: next } : item,
      ),
    );

    try {
      if (next) await followService.follow(user.id);
      else await followService.unfollow(user.id);
    } catch (err) {
      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, isFollowing: !next } : item,
        ),
      );
      throw err;
    }
  }, []);

  return {
    users,
    posts,
    hashtags,
    isLoading,
    error,
    toggleFollow,
  };
}
