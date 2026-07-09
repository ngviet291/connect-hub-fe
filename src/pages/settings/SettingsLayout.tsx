import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/store/AuthContext';
import { useTranslation } from 'react-i18next';
import { NotificationDropdown } from '../../features/notification/components/NotificationDropdown';
import {
  ArrowLeftIcon, LogoIcon, UserIcon, LockIcon, SettingsIcon, ShieldIcon, ChevronRightIcon,
} from '../../shared/components/icons/Icons';

export const SettingsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const items = [
    { to: '/settings/account', label: t('settings_account'), icon: UserIcon },
    { to: '/settings/privacy', label: t('settings_privacy'), icon: LockIcon },
    { to: '/settings/theme', label: t('settings_theme'), icon: SettingsIcon },
    { to: '/settings/security', label: t('settings_security'), icon: ShieldIcon },
  ];

  // On mobile, /settings shows only the list; a sub-route shows only the content.
  const isIndex = location.pathname === '/settings' || location.pathname === '/settings/';
  const activeItem = items.find(i => location.pathname.startsWith(i.to));
  const headerTitle = isIndex ? t('nav_settings') : (activeItem?.label ?? t('nav_settings'));

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-surface/85 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="-ml-1.5 cursor-pointer rounded-full p-1.5 hover:bg-surface-hover md:hidden"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <Link to="/" className="cursor-pointer md:hidden">
            <LogoIcon size={24} />
          </Link>
          <h1 className="text-lg font-bold text-text">{headerTitle}</h1>
        </div>
        {user && <div className="md:hidden"><NotificationDropdown /></div>}
      </div>

      {/* Mobile: plain vertical list, content only shows after tapping an item */}
      {isIndex && (
        <nav className="flex flex-col md:hidden">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className="flex cursor-pointer items-center gap-3 border-b border-border px-4 py-3.5 text-sm font-medium text-text hover:bg-surface-hover"
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              <ChevronRightIcon size={16} className="text-secondary" />
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="cursor-pointer border-b border-border px-4 py-3.5 text-left text-sm font-semibold text-danger hover:bg-surface-hover"
          >
            {t('nav_logout')}
          </button>
        </nav>
      )}

      {/* Desktop: horizontal tab list, always visible */}
      <nav className="hidden gap-1 overflow-x-auto border-b border-border px-2 py-2 scrollbar-none md:flex">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface-hover hover:text-text'
              }`
            }
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </nav>

      {/* Content: hidden on the mobile list view, always visible on desktop */}
      <div className={`p-4 ${isIndex ? 'hidden md:block' : ''}`}>
        <Outlet />
      </div>

      <div className="hidden border-t border-border p-4 md:block">
        <button onClick={logout} className="cursor-pointer text-sm font-semibold text-danger hover:underline">
          {t('nav_logout')}
        </button>
      </div>
    </div>
  );
};
