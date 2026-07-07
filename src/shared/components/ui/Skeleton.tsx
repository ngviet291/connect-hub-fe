export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`skeleton rounded-md ${className}`} />
);

export const PostSkeleton = () => (
  <div className="flex gap-3 border-b border-border px-4 py-4">
    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
    <div className="flex-1 space-y-2.5">
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-3/4" />
      <div className="flex gap-4 pt-1">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  </div>
);

export const ProfileHeaderSkeleton = () => (
  <div className="p-4">
    <div className="flex items-start justify-between">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="h-9 w-24 rounded-full" />
    </div>
    <Skeleton className="mt-4 h-4 w-40" />
    <Skeleton className="mt-2 h-3.5 w-24" />
    <Skeleton className="mt-3 h-3.5 w-full" />
  </div>
);

export const UserRowSkeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3">
    <Skeleton className="h-11 w-11 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton className="h-8 w-20 rounded-full" />
  </div>
);

export const NotificationItemSkeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3.5">
    <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

export const MessageSkeleton = ({ align = 'left' }: { align?: 'left' | 'right' }) => (
  <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
    <Skeleton className={`h-9 rounded-2xl ${align === 'right' ? 'w-40 rounded-br-md' : 'w-52 rounded-bl-md'}`} />
  </div>
);
