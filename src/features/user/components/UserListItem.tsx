import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { Button } from '../../../shared/components/ui/Button';
import type { UserProfile } from '../types/user.types';
import { useTranslation } from 'react-i18next';

interface UserListItemProps {
  user: UserProfile;
  onToggleFollow?: (user: UserProfile) => void;
  hideFollowButton?: boolean;
}

export const UserListItem = ({ user, onToggleFollow, hideFollowButton }: UserListItemProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface/50">
      <Avatar src={user.avatarUrl} name={user.displayName} size="lg" onClick={() => navigate(`/profile/${user.username}`)} />
      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/profile/${user.username}`)}>
        <p className="truncate font-semibold text-text">{user.displayName}</p>
        <p className="truncate text-sm text-secondary">@{user.username}</p>
        {user.bio && <p className="mt-0.5 truncate text-sm text-secondary">{user.bio}</p>}
      </div>
      {!hideFollowButton && (
        <Button
          size="sm"
          variant={user.isFollowing ? 'outline' : 'primary'}
          onClick={() => onToggleFollow?.(user)}
          className="shrink-0"
        >
          {user.isFollowing ? t('following') : t('follow')}
        </Button>
      )}
    </div>
  );
};
