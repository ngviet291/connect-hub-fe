import { useState } from 'react';
import { useAuth } from '../../features/auth/store/AuthContext';
import { useTranslation } from 'react-i18next';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';

export const AccountSettingsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex max-w-md flex-col gap-5">
      <div>
        <h2 className="mb-1 text-base font-semibold text-text">{t('account_info_title')}</h2>
        <p className="text-sm text-secondary">{t('account_info_desc')}</p>
      </div>
      <Input label={t('display_name')} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      <Input label={t('email')} value={user?.email ?? ''} disabled />
      <Input label={t('username')} value={`@${user?.username ?? ''}`} disabled />
      <div>
        <Button
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          {saved ? t('saved_confirm') : t('save')}
        </Button>
      </div>

      <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/5 p-4">
        <h3 className="font-semibold text-danger">{t('danger_zone')}</h3>
        <p className="mt-1 text-sm text-secondary">{t('danger_zone_desc')}</p>
        <Button variant="danger" size="sm" className="mt-3">{t('delete_account')}</Button>
      </div>
    </div>
  );
};
