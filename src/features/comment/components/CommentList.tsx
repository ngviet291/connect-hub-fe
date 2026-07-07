import { CommentItem } from './CommentItem';
import { EmptyState } from '../../../shared/components/ui/EmptyState';
import { Skeleton } from '../../../shared/components/ui/Skeleton';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { CommentItem as CommentItemType } from '../types/comment.types';

interface CommentListProps {
  comments: CommentItemType[];
  isLoading: boolean;
  onLike?: (id: string) => void;
}

export const CommentList = ({ comments, isLoading, onLike }: CommentListProps) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 border-b border-border px-4 py-3.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) return <EmptyState title={t('comment_empty_title')} description={t('comment_empty_desc')} />;

  return (
    <div>
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} onLike={onLike} />
      ))}
    </div>
  );
};
