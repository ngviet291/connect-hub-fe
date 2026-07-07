import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { translations, type Locale, type TranslationKey } from '../i18n/translations';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const STORAGE_KEY = 'connecthub-locale';

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'vi';
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored === 'vi' || stored === 'en') return stored;
  return navigator.language?.startsWith('en') ? 'en' : 'vi';
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  const t = useCallback((key: TranslationKey) => translations[locale][key] ?? translations.vi[key], [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
