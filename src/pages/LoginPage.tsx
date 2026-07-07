import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/store/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../shared/components/ui/Button';
import { Input } from '../shared/components/ui/Input';
import { LogoIcon } from '../shared/components/icons/Icons';

export const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ emailOrUsername, password });
      navigate('/');
    } catch {
      setError('Tên người dùng/email hoặc mật khẩu không đúng.');
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
            <h1 className="text-2xl font-bold text-text">{t('login_title')}</h1>
            <p className="mt-1 text-sm text-secondary">{t('login_subtitle')}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
          <Input label={t('login_identifier')} type="text" placeholder="you@example.com hoặc @username" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} required autoFocus />
          <div>
            <Input label={t('password')} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Link to="/forgot-password" className="mt-1.5 inline-block text-xs font-medium text-primary hover:underline">
              {t('forgot_password')}
            </Link>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={loading} fullWidth size="lg">
            {t('login_submit')}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-secondary">
          {t('login_no_account')}{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            {t('register_link')}
          </Link>
        </p>
      </div>
    </div>
  );
};
