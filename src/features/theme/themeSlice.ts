import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'connecthub-theme';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyThemeToDOM = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
};

// Apply ngay khi load để tránh flash
const initialTheme = getInitialTheme();
applyThemeToDOM(initialTheme);

const themeSlice = createSlice({
  name: 'theme',
  initialState: { theme: initialTheme } as { theme: Theme },
  reducers: {
    setTheme(state, { payload }: PayloadAction<Theme>) {
      state.theme = payload;
      localStorage.setItem(STORAGE_KEY, payload);
      applyThemeToDOM(payload);
    },
    toggleTheme(state) {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = next;
      localStorage.setItem(STORAGE_KEY, next);
      applyThemeToDOM(next);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export const selectTheme = (s: RootState) => s.theme.theme;
export default themeSlice.reducer;
