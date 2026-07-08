import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

const STORAGE_KEY = 'connecthub-locale';

const getInitialLocale = (): string => {
  if (typeof window === 'undefined') return 'vi';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'vi' || stored === 'en') return stored;
  return navigator.language?.startsWith('en') ? 'en' : 'vi';
};

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: translations.vi },
    en: { translation: translations.en },
  },
  lng: getInitialLocale(),
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
