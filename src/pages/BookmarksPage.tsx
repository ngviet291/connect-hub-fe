import { PostCard } from '../features/post/components/PostCard';
import { PostSkeleton } from '../shared/components/ui/Skeleton';
import { EmptyState } from '../shared/components/ui/EmptyState';
import { BookmarkIcon } from '../shared/components/icons/Icons';
import { useBookmarks } from '../features/post/hooks/useBookmarks';
import { useLanguage } from '../contexts/LanguageContext';

export const BookmarksPage = () => {
  const { t } = useLanguage();
  const { posts, isLoading, toggleLike, toggleRepost, toggleBookmark, removePost } = useBookmarks();

  return (
    <div className="animate-fade-in">
      <div className="sticky top-14 z-10 hidden border-b border-border bg-surface/85 px-4 py-3.5 backdrop-blur-md md:top-0 md:block">
        <h1 className="text-xl font-bold text-text">{t('nav_bookmarks')}</h1>
      </div>
      {isLoading && Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}
      {!isLoading && posts.length === 0 && (
        <EmptyState icon={<BookmarkIcon size={32} />} title={t('no_bookmarks_title')} description={t('no_bookmarks_desc')} />
      )}
      {!isLoading &&
        posts.map((p) => (
          <PostCard key={p.id} post={p} onLike={toggleLike} onRepost={toggleRepost} onBookmark={toggleBookmark} onDelete={removePost} />
        ))}
    </div>
  );
};
