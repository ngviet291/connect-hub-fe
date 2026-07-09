import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../../i18n/locales';
import type { Locale } from '../../i18n/translations';
import { SunIcon, MoonIcon } from '../../shared/components/icons/Icons';

export const ThemeSettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;

  const themeOptions = [
    { value: 'light' as const, label: t('theme_light'), icon: SunIcon, bg: 'bg-white',  text: 'text-black' },
    { value: 'dark'  as const, label: t('theme_dark'),  icon: MoonIcon, bg: 'bg-black', text: 'text-white' },
  ];

  return (
    <div className="max-w-md space-y-8">

      {/* ── Theme ── */}
      <section>
        <h2 className="mb-1 text-base font-semibold text-text">{t('settings_theme')}</h2>
        <p className="mb-4 text-sm text-secondary">
{t('theme_desc')}</p>
        <div className="grid grid-cols-2 gap-3">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`cursor-pointer rounded-2xl border-2 p-3 text-left transition-all ${
                theme === opt.value
                  ? 'border-primary'
                  : 'border-border hover:border-secondary'
              }`}
            >
              <div className={`mb-3 flex h-20 items-center justify-center rounded-xl ${opt.bg}`}>
                <opt.icon size={24} className={opt.text} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text">{opt.label}</span>
                {theme === opt.value && <span className="text-primary">●</span>}
              </div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-secondary">{t('theme_auto_hint')}</p>
      </section>

      {/* ── Language ── */}
      <section>
        <h2 className="mb-1 text-base font-semibold text-text">{t('language')}</h2>
        <p className="mb-4 text-sm text-secondary">
{t('language_desc')}</p>
        <div className="flex flex-col gap-2">
          {SUPPORTED_LOCALES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => i18n.changeLanguage(opt.value)}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 px-4 py-3 transition-all ${
                locale === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-secondary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.flag}</span>
                <span className="text-sm font-medium text-text">{opt.label}</span>
              </div>
              {locale === opt.value && <span className="text-primary">●</span>}
            </button>
          ))}
        </div>
      </section>

    </div>
  );
};
