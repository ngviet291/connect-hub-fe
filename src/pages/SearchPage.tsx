import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '../shared/components/ui/Input';
import { SearchIcon } from '../shared/components/icons/Icons';
import { UserListItem } from '../features/user/components/UserListItem';
import { UserRowSkeleton } from '../shared/components/ui/Skeleton';
import { EmptyState } from '../shared/components/ui/EmptyState';
import { TrendingWidget } from '../shared/components/layout/TrendingWidget';
import { useDebounce } from '../shared/hooks/useDebounce';
import { userApi } from '../features/user/api/userApi';
import type { UserProfile } from '../features/user/types/user.types';
import { useLanguage } from '../contexts/LanguageContext';

export const SearchPage = () => {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const debounced = useDebounce(query, 350);
  const [results, setResults] = useState<UserProfile[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults(null);
      return;
    }
    setIsLoading(true);
    userApi
      .searchUsers(debounced)
      .then(setResults)
      .finally(() => setIsLoading(false));
  }, [debounced]);

  const toggleFollow = async (u: UserProfile) => {
    setResults((prev) => prev?.map((x) => (x.id === u.id ? { ...x, isFollowing: !x.isFollowing } : x)) ?? null);
    u.isFollowing ? await userApi.unfollow(u.id) : await userApi.follow(u.id);
  };

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-10 border-b border-border bg-surface/85 p-3 backdrop-blur-md">
        <Input
          leftIcon={<SearchIcon size={18} />}
          placeholder={t('search_placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {!query.trim() && (
        <div className="p-4 md:hidden">
          <TrendingWidget />
        </div>
      )}

      {isLoading && Array.from({ length: 4 }).map((_, i) => <UserRowSkeleton key={i} />)}

      {!isLoading && query.trim() && results?.length === 0 && (
        <EmptyState icon={<SearchIcon size={32} />} title={t('no_results_title')} description={`${t('no_results_for')} "${query}"`} />
      )}

      {!isLoading && results?.map((u) => <UserListItem key={u.id} user={u} onToggleFollow={toggleFollow} />)}
    </div>
  );
};
