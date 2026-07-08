import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { HeartIcon } from '../../../shared/components/icons/Icons';
import { useTimeAgo } from '../../../shared/utils/date';
import type { CommentItem as CommentItemType } from '../types/comment.types';

export const CommentItem = ({ comment, onLike }: { comment: CommentItemType; onLike?: (id: string) => void }) => {
  const navigate = useNavigate();
  const timeAgo = useTimeAgo();
  return (
    <div className="flex gap-3 border-b border-border px-4 py-3.5 animate-fade-in">
      <Avatar src={comment.user.avatarUrl} name={comment.user.displayName} size="sm" onClick={() => navigate(`/profile/${comment.user.username}`)} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="cursor-pointer font-semibold text-text hover:underline" onClick={() => navigate(`/profile/${comment.user.username}`)}>
            {comment.user.displayName}
          </span>
          <span className="text-secondary">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] text-text">{comment.content}</p>
        <button
          onClick={() => onLike?.(comment.id)}
          className={`mt-1.5 flex cursor-pointer items-center gap-1 text-xs transition-transform active:scale-90 ${comment.isLiked ? 'text-rose-500' : 'text-secondary hover:text-rose-500'}`}
        >
          <HeartIcon size={14} filled={comment.isLiked} />
          {comment.likeCount > 0 && comment.likeCount}
        </button>
      </div>
    </div>
  );
};
