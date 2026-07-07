import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../features/auth/api/authApi';
import { useAuth } from '../features/auth/store/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../shared/components/ui/Button';
import { LogoIcon, MailIcon } from '../shared/components/icons/Icons';

export const VerifyEmailPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[idx] = value.slice(-1);
    setDigits(next);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyEmail({ code: digits.join('') });
      if (res.verified) navigate('/');
      else setError(t('verify_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await authApi.resendVerification();
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-slide-up text-center">
        <div className="mb-6 flex flex-col items-center gap-3">
          <LogoIcon size={44} />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailIcon size={28} />
          </div>
          <h1 className="text-2xl font-bold text-text">{t('verify_title')}</h1>
          <p className="text-sm text-secondary">
            {t('verify_subtitle_prefix')} <span className="font-medium text-text">{user?.email ?? t('your_email')}</span>
          </p>
        </div>

        <div className="mb-4 flex justify-center gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              maxLength={1}
              inputMode="numeric"
              className="h-12 w-11 rounded-xl border border-border bg-surface text-center text-lg font-semibold text-text outline-none focus:border-primary"
            />
          ))}
        </div>
        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        <Button fullWidth size="lg" loading={loading} disabled={digits.some((d) => !d)} onClick={handleVerify}>
          {t('verify_submit')}
        </Button>

        <button onClick={handleResend} className="mt-4 cursor-pointer text-sm font-medium text-primary hover:underline">
          {resent ? t('resend_sent') : t('resend_code')}
        </button>
      </div>
    </div>
  );
};
