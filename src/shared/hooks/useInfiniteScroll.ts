import { useEffect, useRef } from 'react';

interface Options {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
}

export function useInfiniteScroll<T extends HTMLElement>({ hasMore, isLoading, onLoadMore, rootMargin = '400px' }: Options) {
  const sentinelRef = useRef<T | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) onLoadMore();
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore, rootMargin]);

  return sentinelRef;
}
