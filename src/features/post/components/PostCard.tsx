import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { Dropdown } from "../../../shared/components/ui/Dropdown";
import {
  HeartIcon,
  ReplyIcon,
  RepostIcon,
  ShareIcon,
  BookmarkIcon,
  MoreHorizontalIcon,
} from "../../../shared/components/icons/Icons";
import { useTimeAgo } from "../../../shared/utils/date";
import { useAuth } from "../../auth/store/AuthContext";
import { useTranslation } from "react-i18next";
import type { Post } from "../types/post.types";
import { MediaGrid } from "./MediaGrid";

interface PostCardProps {
  post: Post;
  onLike?: (id: string, isLiked: boolean) => void;
  onRepost?: (id: string, isReposted: boolean) => void;
  onBookmark?: (id: string, isBookmarked: boolean) => void;
  onDelete?: (id: string) => void;
  clickable?: boolean;
}

export const PostCard = ({
  post,
  onLike,
  onRepost,
  onBookmark,
  onDelete,
  clickable = true,
}: PostCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const timeAgo = useTimeAgo();
  const isOwner = user?.username === post.user.username;

  const goToDetail = () => clickable && navigate(`/post/${post.id}`);
  const goToProfile = (e: MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.user.username}`);
  };
  const stop = (fn?: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    fn?.();
  };

  return (
    <article
      onClick={goToDetail}
      className={`border-b border-border px-4 py-4 transition-colors ${clickable ? "cursor-pointer hover:bg-surface/60" : ""}`}
    >
      <div className="flex gap-3">
        <Avatar
          src={post.user.avatarUrl}
          name={post.user.displayName}
          onClick={goToProfile}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-[15px]">
              <span
                onClick={goToProfile}
                className="cursor-pointer font-semibold text-text hover:underline"
              >
                {post.user.displayName}
              </span>
              <span className="text-secondary">@{post.user.username}</span>
              <span className="text-secondary">·</span>
              <span className="text-secondary">{timeAgo(post.createdAt)}</span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <Dropdown
                trigger={
                  <button className="cursor-pointer rounded-full p-1 text-secondary hover:bg-surface-hover hover:text-text">
                    <MoreHorizontalIcon size={18} />
                  </button>
                }
                items={
                  isOwner
                    ? [
                        { label: t("hide_post"), onClick: () => {} },
                        {
                          label: t("delete_post"),
                          danger: true,
                          onClick: () => onDelete?.(post.id),
                        },
                      ]
                    : [
                        { label: t("unfollow"), onClick: () => {} },
                        { label: t("report"), danger: true, onClick: () => {} },
                      ]
                }
              />
            </div>
          </div>

          <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-text">
            {post.content}
          </p>
          {post.media && post.media.length > 0 && (
            <MediaGrid media={post.media} />
          )}

          <div className="mt-3 flex items-center gap-5">
            <button
              onClick={stop(() => onLike?.(post.id, post.isLiked))}
              className={`flex cursor-pointer items-center gap-1.5 text-sm transition-transform active:scale-90 ${post.isLiked ? "text-rose-500" : "text-secondary hover:text-rose-500"}`}
            >
              <HeartIcon size={20} filled={post.isLiked} />
              <span>{post.likeCount}</span>
            </button>
            <button
              onClick={goToDetail}
              className="flex cursor-pointer items-center gap-1.5 text-sm text-secondary transition-colors hover:text-primary"
            >
              <ReplyIcon size={20} />
              <span>{post.replyCount}</span>
            </button>
            <button
              onClick={stop(() => onRepost?.(post.id, post.isReposted))}
              className={`flex cursor-pointer items-center gap-1.5 text-sm transition-transform active:scale-90 ${post.isReposted ? "text-emerald-500" : "text-secondary hover:text-emerald-500"}`}
            >
              <RepostIcon size={20} />
              <span>{post.repostCount}</span>
            </button>
            <button
              onClick={stop()}
              className="flex cursor-pointer items-center gap-1.5 text-sm text-secondary transition-colors hover:text-primary"
            >
              <ShareIcon size={19} />
            </button>
            <button
              onClick={stop(() => onBookmark?.(post.id, post.isBookmarked))}
              className={`ml-auto flex cursor-pointer items-center gap-1.5 text-sm transition-transform active:scale-90 ${post.isBookmarked ? "text-primary" : "text-secondary hover:text-primary"}`}
            >
              <BookmarkIcon size={19} filled={post.isBookmarked} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
