import { useState } from 'react';
import { Toggle } from '../../shared/components/ui/Toggle';
import { useTranslation } from 'react-i18next';

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

  const set = (key: keyof typeof state) => (v: boolean) => setState((s) => ({ ...s, [key]: v }));

  return (
    <div className="max-w-md">
      <h2 className="mb-1 text-base font-semibold text-text">{t('privacy_title')}</h2>
      <p className="mb-2 text-sm text-secondary">{t('privacy_desc')}</p>
      <Row title={t('private_account_label')} description={t('private_account_desc')} checked={state.privateAccount} onChange={set('privateAccount')} />
      <Row title={t('hide_activity_label')} description={t('hide_activity_desc')} checked={state.hideActivity} onChange={set('hideActivity')} />
      <Row title={t('allow_mentions_label')} description={t('allow_mentions_desc')} checked={state.allowMentions} onChange={set('allowMentions')} />
      <Row title={t('allow_messages_label')} description={t('allow_messages_desc')} checked={state.allowMessages} onChange={set('allowMessages')} />
    </div>
  );
};
