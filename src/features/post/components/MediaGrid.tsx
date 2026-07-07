import type { PostMedia } from '../types/post.types';

export const MediaGrid = ({ media }: { media: PostMedia[] }) => {
  if (media.length === 0) return null;

  const gridCls =
    media.length === 1
      ? 'grid-cols-1'
      : media.length === 2
      ? 'grid-cols-2'
      : media.length === 3
      ? 'grid-cols-2'
      : 'grid-cols-2';

  return (
    <div className={`mt-3 grid ${gridCls} gap-1 overflow-hidden rounded-2xl border border-border`}>
      {media.map((m, i) => (
        <div key={m.id} className={`relative bg-surface ${media.length === 3 && i === 0 ? 'row-span-2' : ''}`}>
          {m.type === 'VIDEO' ? (
            <video src={m.url} controls className="max-h-[520px] w-full object-cover" onClick={(e) => e.stopPropagation()} />
          ) : (
            <img src={m.url} alt="" loading="lazy" className="max-h-[520px] w-full object-cover" />
          )}
        </div>
      ))}
    </div>
  );
};
