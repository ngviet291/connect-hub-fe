import { useCallback, useEffect, useState } from "react";
import type { FollowUser, UserSummaryResponse } from "../types/follow.types";
import { followService } from "../service/followService";

/**
 * Dùng cho FollowListPage (mode="followers" | "following").
 * Lưu ý: API hiện tại (/v1/users/followers, /v1/users/following) chỉ trả về danh sách
 * của CHÍNH user đang đăng nhập — chưa hỗ trợ xem followers/following của người khác theo :username.
 * Nếu cần xem của người khác, backend cần bổ sung endpoint theo userId/username.
 */
export function useFollowList(mode: "followers" | "following") {
  const [items, setItems] = useState<UserSummaryResponse[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPage = useCallback(
    async (reset = false) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const fetcher =
          mode === "followers"
            ? followService.getFollowers
            : followService.getFollowing;
        const page = await fetcher(reset ? undefined : (cursor ?? undefined));
        setItems((prev) => (reset ? page.content : [...prev, ...page.content]));
        setCursor(page.nextCursor);
        setHasMore(page.hasNext);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, cursor, isLoading],
  );

  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    fetchPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return { items, hasMore, isLoading, loadMore: () => fetchPage(false) };
}
