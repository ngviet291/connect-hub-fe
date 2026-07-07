import { PostForm } from '../features/post/components/PostForm';
import { PostList } from '../features/post/components/PostList';
import { useLanguage } from '../contexts/LanguageContext';

export const HomePage = () => {
  const { t } = useLanguage();
  return (
    <div className="animate-fade-in">
      <div className="sticky top-14 z-10 hidden border-b border-border bg-surface/85 px-4 py-3.5 backdrop-blur-md md:top-0 md:block">
        <h1 className="text-xl font-bold text-text">{t('feed_title')}</h1>
      </div>
      <PostForm />
      <PostList />
    </div>
  );
};
