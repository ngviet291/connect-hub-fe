import type { Locale } from './translations';

// Tên hiển thị của ngôn ngữ luôn ở dạng "tên gốc" (Tiếng Việt vẫn là "Tiếng Việt" dù UI đang ở locale nào),
// nên không đưa vào translations.ts — nhưng gom về 1 file config duy nhất thay vì hardcode trong component.
export interface LocaleOption {
  value: Locale;
  flag: string;
  label: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { value: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { value: 'en', flag: '🇬🇧', label: 'English' },
];
