import { Link, useLocation } from 'react-router-dom';
import { LogoIcon } from '../icons/Icons';
import { NotificationDropdown } from '../../../features/notification/components/NotificationDropdown';
import { useAuth } from '../../../features/auth/store/AuthContext';
import { useTranslation } from 'react-i18next';

export const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const TITLES: Record<string, string> = {
    '/': t('nav_home'),
    '/search': t('nav_search'),
    '/notifications': t('notifications_title'),
    '/messages': t('messages_title'),
    '/bookmarks': t('nav_bookmarks'),
  };

  const title = TITLES[location.pathname];

  // Các trang chi tiết (profile, post, followers, settings, chat...) tự có
  // thanh header riêng (mũi tên back + tiêu đề), nên ẩn hẳn Navbar chung ở
  // đây để tránh 2 thanh header dính chồng lên nhau.
  if (!title) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="cursor-pointer">
            <LogoIcon size={26} />
          </Link>
          <h1 className="text-lg font-bold text-text">{title}</h1>
        </div>
        {user && <NotificationDropdown />}
      </div>
    </header>
  );
};
