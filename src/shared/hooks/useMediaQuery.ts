import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const listener = () => setMatches(mql.matches);
    listener();
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
