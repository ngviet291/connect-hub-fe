import { useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Locale } from '../../i18n/translations';

// Map locale nội bộ ('vi' | 'en') sang locale chuẩn Intl để format ngày tháng
const INTL_LOCALE: Record<Locale, string> = {
  vi: 'vi-VN',
  en: 'en-US',
};

/**
 * Hook trả về hàm timeAgo đã bind theo locale hiện tại (đổi ngôn ngữ realtime khi user chuyển vi/en).
 * Dùng thay cho hàm timeAgo tĩnh cũ (hardcode 'vi-VN' + tiếng Việt cứng).
 */
export const useTimeAgo = () => {
  const { locale, t } = useLanguage();
  const intlLocale = INTL_LOCALE[locale] ?? locale;

  return useMemo(
    () =>
      (dateStr: string): string => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const sec = Math.floor(diff / 1000);
        if (sec < 60) return t('time_just_now');

        const min = Math.floor(sec / 60);
        if (min < 60) return t('time_minutes', { count: min });

        const hr = Math.floor(min / 60);
        if (hr < 24) return t('time_hours', { count: hr });

        const day = Math.floor(hr / 24);
        if (day < 7) return t('time_days', { count: day });

        const week = Math.floor(day / 7);
        if (week < 4) return t('time_weeks', { count: week });

        const date = new Date(dateStr);
        const isThisYear = date.getFullYear() === new Date().getFullYear();
        return date.toLocaleDateString(intlLocale, {
          day: '2-digit',
          month: '2-digit',
          year: isThisYear ? undefined : 'numeric',
        });
      },
    [intlLocale, t],
  );
};

/**
 * Hook trả về hàm format ngày đầy đủ (vd dùng cho tooltip khi hover timestamp), đổi theo locale hiện tại.
 */
export const useFormatFullDate = () => {
  const { locale } = useLanguage();
  const intlLocale = INTL_LOCALE[locale] ?? locale;

  return useMemo(
    () =>
      (dateStr: string): string =>
        new Date(dateStr).toLocaleString(intlLocale, {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
    [intlLocale],
  );
};
