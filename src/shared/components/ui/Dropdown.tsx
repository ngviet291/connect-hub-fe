import { useEffect, useRef, useState, type ReactNode } from 'react';

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

export const Dropdown = ({
  trigger,
  items,
  align = 'right',
  direction = 'down',
  menuClassName = '',
}: {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  direction?: 'up' | 'down';
  menuClassName?: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-40 w-48 animate-scale-in overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-xl ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} ${menuClassName}`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-surface-hover ${item.danger ? 'text-danger' : 'text-text'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
