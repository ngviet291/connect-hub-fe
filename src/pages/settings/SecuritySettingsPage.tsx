import { useState, type FormEvent } from 'react';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { Toggle } from '../../shared/components/ui/Toggle';
import { useLanguage } from '../../contexts/LanguageContext';

export const SecuritySettingsPage = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [twoFactor, setTwoFactor] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      setError(t('password_mismatch'));
      return;
    }
    setError('');
    setSaved(true);
    setForm({ current: '', next: '', confirm: '' });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-md">
      <h2 className="mb-1 text-base font-semibold text-text">{t('security_title')}</h2>
      <p className="mb-4 text-sm text-secondary">{t('security_desc')}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input label={t('current_password')} type="password" value={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))} />
        <Input label={t('new_password')} type="password" value={form.next} onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))} />
        <Input label={t('confirm_password')} type="password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} />
        {error && <p className="text-sm text-danger">{error}</p>}
        <div>
          <Button type="submit">{saved ? t('password_updated') : t('change_password_btn')}</Button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-sm font-medium text-text">{t('two_factor_label')}</p>
          <p className="text-sm text-secondary">{t('two_factor_desc')}</p>
        </div>
        <Toggle checked={twoFactor} onChange={setTwoFactor} />
      </div>
    </div>
  );
};
