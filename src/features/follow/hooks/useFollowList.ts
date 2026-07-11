import { useCallback, useEffect, useRef, useState } from "react";
import { followService } from "../service/followService";
import type { UserSummaryResponse } from "../types/follow.types";

export function useFollowList(
  username: string | undefined,
  mode: "followers" | "following",
) {
  const [items, setItems] = useState<UserSummaryResponse[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const cursorRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  const fetchPage = useCallback(
    async (reset: boolean) => {
      if (!username || isLoadingRef.current) return;

      isLoadingRef.current = true;
      setIsLoading(true);

      const requestedMode = mode;
      const requestedUsername = username;

      try {
        const fetcher =
          requestedMode === "followers"
            ? followService.getFollowers
            : followService.getFollowing;

        const page = await fetcher(
          requestedUsername,
          reset ? undefined : (cursorRef.current ?? undefined),
        );

        // bỏ qua nếu mode/username đã đổi trong lúc chờ response
        if (requestedMode !== mode || requestedUsername !== username) return;

        setItems((prev) => (reset ? page.content : [...prev, ...page.content]));
        setCursor(page.nextCursor);
        cursorRef.current = page.nextCursor;
        setHasMore(page.hasNext);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [mode, username],
  );

  useEffect(() => {
    setItems([]);
    setCursor(null);
    cursorRef.current = null;
    setHasMore(true);
    fetchPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, username]);

  return {
    items,
    hasMore,
    isLoading,
    loadMore: () => fetchPage(false),
  };
}
