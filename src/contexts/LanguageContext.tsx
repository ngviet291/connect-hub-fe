import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/i18n';
import type { Locale, TranslationKey } from '../i18n/translations';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, options?: Record<string, unknown>) => string;
}

const STORAGE_KEY = 'connecthub-locale';

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { t: i18nT } = useTranslation();
  const [locale, setLocaleState] = useState<Locale>(() => (i18n.language as Locale) ?? 'vi');

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    i18n.changeLanguage(next);
    setLocaleState(next);
  }, []);

  // Giữ nguyên signature cũ (không tham số) để không phải sửa các component đang dùng useLanguage(),
  // đồng thời cho phép truyền thêm options (vd { count }) để nội suy chuỗi như time_minutes: '{{count}} phút'
  const t = useCallback(
    (key: TranslationKey, options?: Record<string, unknown>) => i18nT(key, options),
    [i18nT],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
