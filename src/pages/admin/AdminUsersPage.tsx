import { useTranslation } from 'react-i18next';

export const AdminUsersPage = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-xl font-bold text-text">{t('admin_users_title')}</h1>
      <p className="mt-2 text-sm text-secondary">
        {t('admin_users_desc_before')}{' '}
        <code className="rounded bg-surface px-1.5 py-0.5">ROLE_ADMIN</code>.{' '}
        {t('admin_users_desc_after')}
      </p>
    </div>
  );
};
