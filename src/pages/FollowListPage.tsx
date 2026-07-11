import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserListItem } from "../features/user/components/UserListItem";
import { UserRowSkeleton } from "../shared/components/ui/Skeleton";
import { EmptyState } from "../shared/components/ui/EmptyState";
import { ArrowLeftIcon, UserIcon } from "../shared/components/icons/Icons";
import { useTranslation } from "react-i18next";
import { followService } from "@/features/follow/service/followService";
import type { UserSummaryResponse } from "@/features/follow";

export const FollowListPage = ({
  mode,
}: {
  mode: "followers" | "following";
}) => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserSummaryResponse[] | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    setUsers(null);

    const fetcher =
      mode === "followers"
        ? followService.getFollowers
        : followService.getFollowing;

    fetcher(username).then((response) => {
      if (!cancelled) {
        setUsers(response.content);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [username, mode]);

  const toggleFollow = async (u: UserSummaryResponse) => {
    if (pendingIds.has(u.id)) return;

    const wasFollowing = u.isFollowing ;

    setPendingIds((prev) => new Set(prev).add(u.id));
    setUsers(
      (prev) =>
        prev?.map((x) =>
          x.id === u.id ? { ...x, isFollowing: !wasFollowing } : x,
        ) ?? null,
    );

    try {
      wasFollowing
        ? await followService.unfollow(u.id)
        : await followService.follow(u.id);
    } catch (error) {
      // rollback nếu API lỗi
      setUsers(
        (prev) =>
          prev?.map((x) =>
            x.id === u.id ? { ...x, isFollowing: wasFollowing } : x,
          ) ?? null,
      );
      // toast.error(t("follow_action_failed"))
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(u.id);
        return next;
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-surface/85 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer rounded-full p-1.5 hover:bg-surface-hover">
          <ArrowLeftIcon size={20} />
        </button>
        <h1 className="text-lg font-bold text-text">
          @{username} ·{" "}
          {mode === "followers" ? t("followers_label") : t("following")}
        </h1>
      </div>
      {!users &&
        Array.from({ length: 5 }).map((_, i) => <UserRowSkeleton key={i} />)}
      {users?.length === 0 && (
        <EmptyState
          icon={<UserIcon size={32} />}
          title={mode === "followers" ? t("no_followers") : t("no_following")}
        />
      )}
      {users?.map((u) => (
        <UserListItem
          key={u.id}
          user={u}
          onToggleFollow={toggleFollow}
          disabled={pendingIds.has(u.id)}
        />
      ))}
    </div>
  );
};
