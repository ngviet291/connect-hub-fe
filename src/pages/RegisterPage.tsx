import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/store/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '../shared/components/ui/Button';
import { Input } from '../shared/components/ui/Input';
import { LogoIcon } from '../shared/components/icons/Icons';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError(t('register_password_too_short'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t('register_password_mismatch'));
      return;
    }
    setLoading(true);
    try {
      const { username, email, password } = form;
      await register({ username, email, password });
      navigate('/verify-email');
    } catch {
      setError(t('register_failed_retry'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="mb-8 flex flex-col items-center gap-3">
          <LogoIcon size={44} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text">{t('register_title')}</h1>
            <p className="mt-1 text-sm text-secondary">{t('register_subtitle')}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
          <Input label={t('username')} placeholder="username" value={form.username} onChange={set('username')} required />
          <Input label={t('email')} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          <Input label={t('password')} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
          <Input label={t('register_confirm_password')} type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} required />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={loading} fullWidth size="lg">
            {t('register_submit')}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-secondary">
          {t('register_have_account')}{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            {t('login_link')}
          </Link>
        </p>
      </div>
    </div>
  );
};
