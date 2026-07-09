import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { useTimeAgo } from '../../../shared/utils/date';
import type { AppNotification } from '../types/notification.types';
import { NotificationIcon } from './NotificationIcon';

export const NotificationItem = ({ notification, onRead }: { notification: AppNotification; onRead?: (id: string) => void }) => {
  const navigate = useNavigate();
  const timeAgo = useTimeAgo();

  const handleClick = () => {
    onRead?.(notification.id);
    if (notification.targetPostId) navigate(`/post/${notification.targetPostId}`);
    else navigate(`/profile/${notification.actor.username}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface/60 ${!notification.isRead ? 'bg-primary/[0.05]' : ''}`}
    >
      <NotificationIcon type={notification.type} />
      <Avatar src={notification.actor.avatarUrl} name={notification.actor.fullName} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text">
          <span className="font-semibold">{notification.actor.fullName}</span> {notification.message}
        </p>
        <p className="mt-0.5 text-xs text-secondary">{timeAgo(notification.createdAt)}</p>
      </div>
      {!notification.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
    </button>
  );
};
