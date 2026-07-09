import { PostCard } from './PostCard';
import { PostSkeleton } from '../../../shared/components/ui/Skeleton';
import { EmptyState } from '../../../shared/components/ui/EmptyState';
import { ErrorState } from '../../../shared/components/ui/ErrorState';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { useInfiniteScroll } from '../../../shared/hooks/useInfiniteScroll';
import { useTranslation } from 'react-i18next';
import { useFeed } from '../hooks/useFeed';

export const PostList = () => {
  const { t } = useTranslation();
  const { posts, isLoading, error, hasNext, loadMore, toggleLike, toggleRepost, toggleBookmark, removePost, refresh } = useFeed();
  const sentinelRef = useInfiniteScroll<HTMLDivElement>({ hasMore: hasNext, isLoading, onLoadMore: loadMore });

  if (isLoading && posts.length === 0) {
    return (
      <div>
        {Array.from({ length: 4 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error && posts.length === 0) return <ErrorState onRetry={refresh} />;

  if (!isLoading && posts.length === 0)
    return <EmptyState title={t('empty_feed_title')} description={t('empty_feed_desc')} />;

  return (
    <div>
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          onLike={toggleLike}
          onRepost={toggleRepost}
          onBookmark={toggleBookmark}
          onDelete={removePost}
        />
      ))}
      <div ref={sentinelRef} className="flex justify-center py-6">
        {isLoading && posts.length > 0 && <Spinner />}
        {!hasNext && posts.length > 0 && <span className="text-sm text-secondary">{t('end_of_feed')}</span>}
      </div>
    </div>
  );
};
