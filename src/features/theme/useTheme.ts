import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { selectTheme, setTheme, toggleTheme } from './themeSlice';
import type { AppDispatch } from '../../app/store';
import type { Theme } from './themeSlice';

export const useTheme = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector(selectTheme);

  // Lắng nghe system theme thay đổi (chỉ khi user chưa chọn thủ công)
  useEffect(() => {
    const hasManual = !!localStorage.getItem('connecthub-theme');
    if (hasManual) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) =>
      dispatch(setTheme(e.matches ? 'dark' : 'light'));
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [dispatch]);

  return {
    theme,
    setTheme: (t: Theme) => dispatch(setTheme(t)),
    toggleTheme: () => dispatch(toggleTheme()),
  };
};
