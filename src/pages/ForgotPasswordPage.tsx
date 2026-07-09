import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../features/auth/api/authApi';
import { useTranslation } from 'react-i18next';
import { Button } from '../shared/components/ui/Button';
import { Input } from '../shared/components/ui/Input';
import { LogoIcon, ArrowLeftIcon } from '../shared/components/icons/Icons';

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <Link to="/login" className="mb-6 inline-flex items-center gap-1 text-sm text-secondary hover:text-text">
          <ArrowLeftIcon size={16} /> {t('back_to_login')}
        </Link>
        <div className="mb-8 flex flex-col items-center gap-3">
          <LogoIcon size={44} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text">{t('forgot_title')}</h1>
            <p className="mt-1 text-sm text-secondary">{t('forgot_subtitle')}</p>
          </div>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <p className="font-medium text-text">{t('forgot_sent_title')}</p>
            <p className="mt-2 text-sm text-secondary">
              {t('forgot_sent_desc_prefix')} <span className="font-medium text-text">{email}</span> {t('forgot_sent_desc_suffix')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
            <Input label={t('email')} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            <Button type="submit" loading={loading} fullWidth size="lg">
              {t('forgot_submit')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
