import { useRef, useState } from 'react';
import { IconButton } from '../../../shared/components/ui/IconButton';
import { useTranslation } from 'react-i18next';
import { SendIcon, ImageIcon, XIcon } from '../../../shared/components/icons/Icons';
import { createAttachment, revokeAttachment } from '../utils/attachment';
import type { ChatMessage, MessageAttachment } from '../types/message.types';

const MAX_ATTACHMENTS = 4;

export const MessageInput = ({
  onSend,
  disabled,
  replyingTo,
  onCancelReply,
}: {
  onSend: (text: string, media?: MessageAttachment[]) => void;
  disabled?: boolean;
  replyingTo?: ChatMessage | null;
  onCancelReply?: () => void;
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [media, setMedia] = useState<MessageAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    const picked = Array.from(files).slice(0, MAX_ATTACHMENTS - media.length).map(createAttachment);
    setMedia((prev) => [...prev, ...picked]);
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) revokeAttachment(target.url);
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleSend = () => {
    if (!value.trim() && media.length === 0) return;
    onSend(value.trim(), media.length ? media : undefined);
    setValue('');
    setMedia([]);
  };

  return (
    <div className="border-t border-border p-3">
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-surface-hover px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary">{t('reply_to_label')}</p>
            <p className="truncate text-xs text-secondary">
              {replyingTo.recalled ? t('message_recalled') : replyingTo.content || t('message_media_label')}
            </p>
          </div>
          <button onClick={onCancelReply} className="shrink-0 cursor-pointer text-secondary hover:text-text">
            <XIcon size={16} />
          </button>
        </div>
      )}
      {media.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto">
          {media.map((m) => (
            <div key={m.id} className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
              {m.type === 'VIDEO' ? (
                <video src={m.url} className="h-full w-full object-cover" />
              ) : (
                <img src={m.url} alt="" className="h-full w-full object-cover" />
              )}
              <button
                onClick={() => removeMedia(m.id)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white"
              >
                <XIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
        <IconButton
          icon={<ImageIcon size={20} />}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || media.length >= MAX_ATTACHMENTS}
          className="text-secondary hover:bg-surface-hover hover:text-primary"
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('message_placeholder')}
          className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-[15px] text-text placeholder-secondary outline-none focus:border-primary"
        />
        <IconButton
          icon={<SendIcon size={20} />}
          onClick={handleSend}
          disabled={disabled || (!value.trim() && media.length === 0)}
          className="bg-primary text-white hover:bg-primary-hover"
        />
      </div>
    </div>
  );
};
