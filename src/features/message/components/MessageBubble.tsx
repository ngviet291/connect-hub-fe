import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/store/AuthContext';
import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '../types/message.types';
import type { PostAuthor } from '../../post/types/post.types';
import { CommentIcon, SmileIcon, MoreHorizontalIcon } from '../../../shared/components/icons/Icons';
import { Dropdown } from '../../../shared/components/ui/Dropdown';
import { ConfirmModal } from '../../../shared/components/ui/ConfirmModal';
import { Avatar } from '../../../shared/components/ui/Avatar';

const QUICK_REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '🙏'];

export const MessageBubble = ({
  message,
  participant,
  repliedMessage,
  onReply,
  onRecall,
  onReact,
}: {
  message: ChatMessage;
  participant: PostAuthor;
  repliedMessage?: ChatMessage;
  onReply: (message: ChatMessage) => void;
  onRecall: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showReactions, setShowReactions] = useState(false);
  const [confirmRecall, setConfirmRecall] = useState(false);
  const isMine = message.senderId === user?.id;
  const hasMedia = !!message.media?.length;
  const goToProfile = () => navigate(`/profile/${participant.username}`);

  const reactionCounts = (message.reactions ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});
  const myReaction = (message.reactions ?? []).find((r) => r.userId === user?.id)?.emoji;

  if (message.recalled) {
    return (
      <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
        {!isMine && <Avatar src={participant.avatarUrl} name={participant.displayName} size="xs" onClick={goToProfile} />}
        <p className="max-w-[75%] rounded-2xl border border-border px-4 py-2.5 text-sm italic text-secondary">
          {t('message_recalled')}
        </p>
      </div>
    );
  }

  return (
    <div className={`group flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {!isMine && <Avatar src={participant.avatarUrl} name={participant.displayName} size="xs" onClick={goToProfile} />}
      <div className={`flex max-w-[75%] items-center gap-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="flex flex-col">
          <div
            className={`overflow-hidden rounded-2xl ${
              isMine ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md border border-border bg-surface-hover text-text'
            } ${hasMedia ? 'p-1.5' : 'px-4 py-2.5'}`}
          >
            {repliedMessage && (
              <div
                className={`mb-1.5 rounded-lg border-l-2 px-2 py-1 text-xs ${
                  isMine ? 'border-white/50 bg-white/10 text-white/80' : 'border-primary bg-surface text-secondary'
                }`}
              >
                <p className="truncate">
                  {repliedMessage.recalled ? t('message_recalled') : repliedMessage.content || t('message_media_label')}
                </p>
              </div>
            )}
            {hasMedia && (
              <div className={`grid gap-1 ${message.media!.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {message.media!.map((m) =>
                  m.type === 'VIDEO' ? (
                    <video key={m.id} src={m.url} controls className="max-h-64 w-full rounded-xl object-cover" />
                  ) : (
                    <img key={m.id} src={m.url} alt="" className="max-h-64 w-full rounded-xl object-cover" />
                  ),
                )}
              </div>
            )}
            {message.content && (
              <p className={`text-[15px] leading-relaxed ${hasMedia ? 'px-2 pb-1 pt-2' : ''}`}>{message.content}</p>
            )}
          </div>

          {Object.keys(reactionCounts).length > 0 && (
            <div className={`mt-1 flex flex-wrap gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
                  className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs ${
                    myReaction === emoji ? 'border-primary bg-primary/10' : 'border-border bg-surface'
                  }`}
                >
                  <span>{emoji}</span>
                  {count > 1 && <span className="text-secondary">{count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hover toolbar: reply / react / recall */}
        <div className="relative flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onReply(message)}
            title={t('reply_action')}
            className="cursor-pointer rounded-full p-1.5 text-secondary hover:bg-surface-hover hover:text-text"
          >
            <CommentIcon size={16} />
          </button>
          <button
            onClick={() => setShowReactions((v) => !v)}
            title={t('react_action')}
            className="cursor-pointer rounded-full p-1.5 text-secondary hover:bg-surface-hover hover:text-text"
          >
            <SmileIcon size={16} />
          </button>
          {isMine && (
            <Dropdown
              align={isMine ? 'right' : 'left'}
              trigger={
                <button
                  title={t('recall_action')}
                  className="cursor-pointer rounded-full p-1.5 text-secondary hover:bg-surface-hover hover:text-text"
                >
                  <MoreHorizontalIcon size={16} />
                </button>
              }
              items={[
                {
                  label: t('recall_action'),
                  danger: true,
                  onClick: () => setConfirmRecall(true),
                },
              ]}
            />
          )}

          {showReactions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowReactions(false)} />
              <div
                className={`absolute bottom-full z-20 mb-1 flex gap-0.5 rounded-full border border-border bg-surface p-1 shadow-lg ${
                  isMine ? 'right-0' : 'left-0'
                }`}
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(message.id, emoji);
                      setShowReactions(false);
                    }}
                    className="cursor-pointer rounded-full p-1 text-lg transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmRecall}
        onClose={() => setConfirmRecall(false)}
        onConfirm={() => onRecall(message.id)}
        title={t('recall_confirm_title')}
        description={t('recall_confirm_desc')}
        confirmLabel={t('recall_action')}
        cancelLabel={t('cancel')}
        danger
      />
    </div>
  );
};
