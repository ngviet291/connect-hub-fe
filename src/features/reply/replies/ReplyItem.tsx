import { useNavigate } from "react-router-dom";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { HeartIcon } from "../../../shared/components/icons/Icons";
import { useTimeAgo } from "../../../shared/utils/date";
import type { ReplyItem as ReplyItemType } from "../types/reply.types";

export const ReplyItem = ({
  reply,
  onLike,
}: {
  reply: ReplyItemType;
  onLike?: (id: string) => void;
}) => {
  const navigate = useNavigate();
  const timeAgo = useTimeAgo();
  return (
    <div className="flex gap-3 border-b border-border px-4 py-3.5 animate-fade-in">
      <Avatar
        src={reply.user.avatarUrl}
        name={reply.user.fullName}
        size="sm"
        onClick={() => navigate(`/profile/${reply.user.username}`)}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span
            className="cursor-pointer font-semibold text-text hover:underline"
            onClick={() => navigate(`/profile/${reply.user.username}`)}
          >
            {reply.user.fullName}
          </span>
          <span className="text-secondary">{timeAgo(reply.createdAt)}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] text-text">
          {reply.content}
        </p>
        <button
          onClick={() => onLike?.(reply.id)}
          className={`mt-1.5 flex cursor-pointer items-center gap-1 text-xs transition-transform active:scale-90 ${reply.isLiked ? "text-rose-500" : "text-secondary hover:text-rose-500"}`}
        >
          <HeartIcon size={14} filled={reply.isLiked} />
          {reply.likeCount > 0 && reply.likeCount}
        </button>
      </div>
    </div>
  );
};
