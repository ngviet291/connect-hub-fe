import { useState } from 'react';
import { useAuth } from '../../auth/store/AuthContext';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../../../shared/components/ui/Avatar';
import type { Post } from '../types/post.types';
import { CreatePostModal } from './CreatePostModal';

export const PostForm = ({ onCreated }: { onCreated?: (p: Post) => void }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="flex cursor-text items-center gap-3 border-b border-border px-4 py-3.5 transition-colors hover:bg-surface/50"
      >
        <Avatar src={user.avatarUrl} name={user.displayName} />
        <span className="flex-1 text-[15px] text-secondary">{t('composer_placeholder')}</span>
        <span className="pointer-events-none rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white opacity-90">
          {t('post_button')}
        </span>
      </div>
      <CreatePostModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onCreated={(post) => onCreated?.(post)}
      />
    </>
  );
};
