import { useState } from "react";
import { followService } from "../service/followService";
/**
 * Follow/unfollow 1 user cụ thể, có optimistic update qua callback onChange
 * để component cha (PostCard, UserListItem, ProfilePage...) tự cập nhật state của nó.
 */
export function useFollow(
  targetUserId: string,
  initialIsFollowing: boolean,
  onChange?: (isFollowing: boolean) => void,
) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = async () => {
    if (isLoading || !targetUserId) return;
    const next = !isFollowing;
    setIsFollowing(next); // optimistic
    onChange?.(next);
    setIsLoading(true);
    try {
      if (next) await followService.follow(targetUserId);
      else await followService.unfollow(targetUserId);
    } catch (e) {
      // rollback nếu lỗi
      setIsFollowing(!next);
      onChange?.(!next);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return { isFollowing, isLoading, toggle };
}
