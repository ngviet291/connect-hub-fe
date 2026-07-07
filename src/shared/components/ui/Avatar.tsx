import type { MouseEvent } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
  onClick?: (e: MouseEvent) => void;
}

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-24 w-24 text-2xl',
};

const gradients = [
  'from-violet-500 to-fuchsia-500',
  'from-sky-500 to-indigo-500',
  'from-amber-500 to-rose-500',
  'from-emerald-500 to-teal-500',
];

const hashIndex = (str: string) => str.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % gradients.length;

export const Avatar = ({ src, name, size = 'md', ring, onClick }: AvatarProps) => {
  const initials = name.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const cls = `${sizes[size]} shrink-0 rounded-full object-cover ${ring ? 'ring-2 ring-background' : ''} ${onClick ? 'cursor-pointer' : ''}`;

  if (src) {
    return <img src={src} alt={name} className={cls} onClick={onClick} />;
  }
  return (
    <div
      onClick={onClick}
      className={`${cls} flex items-center justify-center bg-gradient-to-br ${gradients[hashIndex(name)]} font-semibold text-white`}
    >
      {initials}
    </div>
  );
};
