import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { Button } from '../../../shared/components/ui/Button';
import { Skeleton } from '../../../shared/components/ui/Skeleton';
import { userApi } from '../api/userApi';
import { useTranslation } from 'react-i18next';
import type { UserProfile } from '../types/user.types';

export const SuggestedUsers = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserProfile[] | null>(null);

  useEffect(() => {
    userApi.getSuggested().then(setUsers);
  }, []);

  const toggleFollow = async (u: UserProfile) => {
    setUsers((prev) => prev?.map((x) => (x.id === u.id ? { ...x, isFollowing: !x.isFollowing } : x)) ?? null);
    u.isFollowing ? await userApi.unfollow(u.id) : await userApi.follow(u.id);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="mb-1 font-semibold text-text">{t('suggested_users')}</h3>
      <div className="flex flex-col divide-y divide-border">
        {!users &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          ))}
        {users?.map((u) => (
          <div key={u.id} className="flex items-center gap-3 py-3">
            <Avatar src={u.avatarUrl} name={u.fullName} size="sm" onClick={() => navigate(`/profile/${u.username}`)} />
            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/profile/${u.username}`)}>
              <p className="truncate text-sm font-semibold text-text">{u.fullName}</p>
              <p className="truncate text-xs text-secondary">@{u.username}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => toggleFollow(u)}>
              {u.isFollowing ? t('unfollow') : t('follow')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
