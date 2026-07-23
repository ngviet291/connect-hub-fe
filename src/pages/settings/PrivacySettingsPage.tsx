import { useEffect, useState } from 'react';
import { Toggle } from '../../shared/components/ui/Toggle';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../../shared/components/ui/Avatar';
import { userService } from '../../features/user/service/userService';
import type { UserSummaryResponse } from '../../features/follow/types/follow.types';
import { useToast } from '../../shared/components/ui/Toast';

const Row = ({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0">
    <div>
      <p className="text-sm font-medium text-text">{title}</p>
      <p className="mt-0.5 text-sm text-secondary">{description}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export const PrivacySettingsPage = () => {
  const { t } = useTranslation();
  const [state, setState] = useState({
    privateAccount: false,
    hideActivity: false,
    allowMentions: true,
    allowMessages: true,
  });
  const [blockedUsers, setBlockedUsers] = useState<UserSummaryResponse[]>([]);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(true);
  const [unblockingIds, setUnblockingIds] = useState<string[]>([]);
  const { showToast } = useToast();

  const set = (key: keyof typeof state) => (v: boolean) => setState((s) => ({ ...s, [key]: v }));

  const loadBlockedUsers = async () => {
    setIsLoadingBlocked(true);
    try {
      const users = await userService.getBlockedUsers();
      setBlockedUsers(users);
    } finally {
      setIsLoadingBlocked(false);
    }
  };

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const handleUnblock = async (userId: string) => {
    if (unblockingIds.includes(userId)) return;
    setUnblockingIds((s) => [...s, userId]);
    try {
      await userService.unblockUser(userId);
      setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
      window.dispatchEvent(new Event('blocked-state-changed'));
      showToast(t('success_unblock_user'), 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('error_generic');
      showToast(msg, 'error');
    } finally {
      setUnblockingIds((s) => s.filter((id) => id !== userId));
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="mb-1 text-base font-semibold text-text">{t('privacy_title')}</h2>
      <p className="mb-2 text-sm text-secondary">{t('privacy_desc')}</p>
      <Row title={t('private_account_label')} description={t('private_account_desc')} checked={state.privateAccount} onChange={set('privateAccount')} />
      <Row title={t('hide_activity_label')} description={t('hide_activity_desc')} checked={state.hideActivity} onChange={set('hideActivity')} />
      <Row title={t('allow_mentions_label')} description={t('allow_mentions_desc')} checked={state.allowMentions} onChange={set('allowMentions')} />
      <Row title={t('allow_messages_label')} description={t('allow_messages_desc')} checked={state.allowMessages} onChange={set('allowMessages')} />

      <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text">{t('blocked_users_title')}</h3>
            <p className="text-sm text-secondary">{t('blocked_users_desc')}</p>
          </div>
        </div>

        {isLoadingBlocked ? (
          <p className="text-sm text-secondary">{t('loading')}</p>
        ) : blockedUsers.length === 0 ? (
          <p className="text-sm text-secondary">{t('blocked_users_empty')}</p>
        ) : (
          <div className="space-y-3">
            {blockedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{user.fullName}</p>
                    <p className="truncate text-xs text-secondary">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnblock(user.id)}
                  disabled={unblockingIds.includes(user.id)}
                  className={`rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-hover ${unblockingIds.includes(user.id) ? 'opacity-60 cursor-wait' : ''}`}
                >
                  {unblockingIds.includes(user.id) ? t('loading') : t('unblock_user')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
