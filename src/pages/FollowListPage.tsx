import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../features/user/api/userApi';
import type { UserProfile } from '../features/user/types/user.types';
import { UserListItem } from '../features/user/components/UserListItem';
import { UserRowSkeleton } from '../shared/components/ui/Skeleton';
import { EmptyState } from '../shared/components/ui/EmptyState';
import { ArrowLeftIcon, UserIcon } from '../shared/components/icons/Icons';
import { useTranslation } from 'react-i18next';

export const FollowListPage = ({ mode }: { mode: 'followers' | 'following' }) => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserProfile[] | null>(null);

  useEffect(() => {
    if (!username) return;
    setUsers(null);
    const fetcher = mode === 'followers' ? userApi.getFollowers : userApi.getFollowing;
    fetcher(username).then(setUsers);
  }, [username, mode]);

  const toggleFollow = async (u: UserProfile) => {
    setUsers((prev) => prev?.map((x) => (x.id === u.id ? { ...x, isFollowing: !x.isFollowing } : x)) ?? null);
    u.isFollowing ? await userApi.unfollow(u.id) : await userApi.follow(u.id);
  };

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-surface/85 px-4 py-3 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="cursor-pointer rounded-full p-1.5 hover:bg-surface-hover">
          <ArrowLeftIcon size={20} />
        </button>
        <h1 className="text-lg font-bold text-text">
          @{username} · {mode === 'followers' ? t('followers_label') : t('following')}
        </h1>
      </div>
      {!users && Array.from({ length: 5 }).map((_, i) => <UserRowSkeleton key={i} />)}
      {users?.length === 0 && (
        <EmptyState icon={<UserIcon size={32} />} title={mode === 'followers' ? t('no_followers') : t('no_following')} />
      )}
      {users?.map((u) => (
        <UserListItem key={u.id} user={u} onToggleFollow={toggleFollow} />
      ))}
    </div>
  );
};
