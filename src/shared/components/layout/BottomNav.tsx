import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../features/auth/store/AuthContext';
import {
  HomeIcon,
  SearchIcon,
  PlusSquareIcon,
  BellIcon,
  UserIcon,
} from '../icons/Icons';
import { useNotifications } from '../../../features/notification/hooks/useNotifications';
import { Avatar } from '../ui/Avatar';

export const BottomNav = ({ onCompose }: { onCompose: () => void }) => {
  const { user }       = useAuth();
  const { unreadCount } = useNotifications();

  if (!user) return null;

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 cursor-pointer items-center justify-center py-3 transition-colors ${
      isActive ? 'text-text' : 'text-secondary'
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      {/* Home */}
      <NavLink to="/" end className={linkCls}>
        <HomeIcon size={26} filled />
      </NavLink>

      {/* Search */}
      <NavLink to="/search" className={linkCls}>
        <SearchIcon size={26} />
      </NavLink>

      {/* Compose */}
      <button
        onClick={onCompose}
        className="flex flex-1 cursor-pointer items-center justify-center py-3 text-secondary"
      >
        <PlusSquareIcon size={26} />
      </button>

      {/* Notifications */}
      <NavLink to="/notifications" className={linkCls}>
        <span className="relative">
          <BellIcon size={26} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent" />
          )}
        </span>
      </NavLink>

      {/* Profile — navigate thẳng, không dropdown */}
      <NavLink to={`/profile/${user.username}`} className={linkCls}>
        {({ isActive }) =>
          user.avatarUrl ? (
            <Avatar
              src={user.avatarUrl}
              name={user.fullName}
              size="xs"
              ring={isActive}
            />
          ) : (
            <UserIcon size={26} filled={isActive} />
          )
        }
      </NavLink>
    </nav>
  );
};
