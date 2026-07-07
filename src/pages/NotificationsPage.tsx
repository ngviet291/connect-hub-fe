import { useState } from 'react';
import { Tabs } from '../shared/components/ui/Tabs';
import { EmptyState } from '../shared/components/ui/EmptyState';
import { ErrorState } from '../shared/components/ui/ErrorState';
import { NotificationItemSkeleton } from '../shared/components/ui/Skeleton';
import { BellIcon } from '../shared/components/icons/Icons';
import { useNotifications } from '../features/notification/hooks/useNotifications';
import { NotificationItem } from '../features/notification/components/NotificationItem';
import { useLanguage } from '../contexts/LanguageContext';

const FILTERS: Record<string, (type: string) => boolean> = {
  all: () => true,
  follows: (type) => type === 'FOLLOW',
  replies: (type) => type === 'COMMENT' || type === 'MENTION',
};

export const NotificationsPage = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState('all');
  const { notifications, isLoading, error, markAsRead, markAllAsRead, refetch, unreadCount } = useNotifications();
  const filtered = notifications.filter((n) => FILTERS[tab](n.type));

  return (
    <div className="animate-fade-in">
      <div className="sticky top-14 z-10 hidden items-center justify-between border-b border-border bg-surface/85 px-4 py-3.5 backdrop-blur-md md:top-0 md:flex">
        <h1 className="text-xl font-bold text-text">{t('notifications_title')}</h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="cursor-pointer text-sm font-medium text-primary hover:underline">
            {t('mark_all_read')}
          </button>
        )}
      </div>
      <Tabs
        tabs={[
          { key: 'all', label: t('tab_all') },
          { key: 'follows', label: t('tab_follows') },
          { key: 'replies', label: t('replies_tab') },
        ]}
        active={tab}
        onChange={setTab}
      />
      {isLoading &&
        Array.from({ length: 5 }).map((_, i) => <NotificationItemSkeleton key={i} />)}
      {error && <ErrorState onRetry={refetch} />}
      {!isLoading && filtered.length === 0 && (
        <EmptyState icon={<BellIcon size={32} />} title={t('empty_notifications')} description={t('empty_notifications_desc')} />
      )}
      {filtered.map((n) => (
        <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
      ))}
    </div>
  );
};
