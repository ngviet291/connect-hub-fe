import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "../shared/components/ui/Input";
import { SearchIcon } from "../shared/components/icons/Icons";
import { UserListItem } from "../features/user/components/UserListItem";
import { UserRowSkeleton } from "../shared/components/ui/Skeleton";
import { EmptyState } from "../shared/components/ui/EmptyState";
import { TrendingWidget } from "../shared/components/layout/TrendingWidget";
import { useDebounce } from "../shared/hooks/useDebounce";
import { useTranslation } from "react-i18next";
import { useSearchUsers } from "@/features/search";
import { PostCard } from "../features/post/components/PostCard";

export const SearchPage = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const debounced = useDebounce(query, 350);
  const { users, posts, hashtags, isLoading, error, toggleFollow } = useSearchUsers(debounced);

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-10 border-b border-border bg-surface/85 p-3 backdrop-blur-md">
        <Input
          leftIcon={<SearchIcon size={18} />}
          placeholder={t("search_placeholder")}
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

      {isLoading &&
        Array.from({ length: 4 }).map((_, i) => <UserRowSkeleton key={i} />)}

      {!isLoading && query.trim() && users.length === 0 && posts.length === 0 && hashtags.length === 0 && !error && (
        <EmptyState
          icon={<SearchIcon size={32} />}
          title={t("no_results_title")}
          description={`${t("no_results_for")} "${query}"`}
        />
      )}

      {error && query.trim() && (
        <div className="px-4 py-6 text-sm text-danger">{error}</div>
      )}

      {!isLoading && (
        <>
          {users.length > 0 && (
            <div className="border-b border-border">
              <div className="px-4 py-2 text-sm font-semibold text-secondary">Users</div>
              {users.map((u) => (
                <UserListItem key={u.id} user={u} onToggleFollow={toggleFollow} />
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <div className="border-b border-border">
              <div className="px-4 py-2 text-sm font-semibold text-secondary">Posts</div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {hashtags.length > 0 && (
            <div>
              <div className="px-4 py-2 text-sm font-semibold text-secondary">Hashtags</div>
              {hashtags.map((tag) => (
                <div key={tag.id} className="border-b border-border px-4 py-3 text-sm text-text">
                  #{tag.name}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
