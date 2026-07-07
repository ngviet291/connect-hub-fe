import { useCallback, useEffect, useRef, useState } from 'react';

interface ScrollFadeProps {
  children: React.ReactNode;
  /** CSS class đặt lên container scroll (thường dùng cho flex + whitespace-nowrap) */
  className?: string;
  /** Màu nền để tạo gradient (mặc định lấy từ --color-surface) */
  fadeColor?: string;
  /** Chiều rộng vùng fade (px, mặc định 40) */
  fadeWidth?: number;
}

/**
 * Bọc vùng scroll ngang.
 * Tự động hiện gradient fade ở cạnh trái/phải khi còn nội dung bị ẩn,
 * giúp người dùng nhận biết có thể lướt thêm.
 *
 * Usage:
 *   <ScrollFade className="flex gap-2">
 *     <Tab /><Tab /><Tab />...
 *   </ScrollFade>
 */
export const ScrollFade = ({
  children,
  className = '',
  fadeColor,
  fadeWidth = 40,
}: ScrollFadeProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft,  setShowLeft]  = useState(false);
  const [showRight, setShowRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeft(scrollLeft > 2);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  // Đo lại khi mount + resize
  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  // Màu fade lấy từ prop hoặc CSS variable
  const color = fadeColor ?? 'var(--color-surface)';
  const fadeStyle = (dir: 'left' | 'right'): React.CSSProperties => ({
    position:       'absolute',
    top:            0,
    bottom:         0,
    [dir]:          0,
    width:          fadeWidth,
    pointerEvents:  'none',
    zIndex:         10,
    background: `linear-gradient(to ${dir === 'left' ? 'right' : 'left'}, ${color} 0%, transparent 100%)`,
    transition:     'opacity 0.2s',
    opacity:        dir === 'left' ? (showLeft  ? 1 : 0) : (showRight ? 1 : 0),
  });

  return (
    <div style={{ position: 'relative' }}>
      {/* Fade trái */}
      <div style={fadeStyle('left')} aria-hidden />

      {/* Vùng scroll — ẩn thanh scrollbar nhưng vẫn scroll được */}
      <div
        ref={scrollRef}
        onScroll={update}
        className={`overflow-x-auto ${className}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {children}
      </div>

      {/* Fade phải */}
      <div style={fadeStyle('right')} aria-hidden />
    </div>
  );
};
