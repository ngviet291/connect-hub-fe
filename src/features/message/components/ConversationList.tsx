import { useNavigate, useParams } from 'react-router-dom';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { UserRowSkeleton } from '../../../shared/components/ui/Skeleton';
import { EmptyState } from '../../../shared/components/ui/EmptyState';
import { useTimeAgo } from '../../../shared/utils/date';
import { useConversations } from '../hooks/useConversations';
import { useTranslation } from 'react-i18next';
import { MailIcon } from '../../../shared/components/icons/Icons';

export const ConversationList = () => {
  const { t } = useTranslation();
  const timeAgo = useTimeAgo();
  const { conversations, isLoading } = useConversations();
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 4 }).map((_, i) => (
          <UserRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return <EmptyState icon={<MailIcon size={32} />} title={t('no_messages_title')} description={t('no_messages_desc')} />;
  }

  return (
    <div className="flex flex-col">
      {conversations.map((c) => (
        <button
          key={c.conversationId}
          onClick={() => navigate(`/messages/${c.conversationId}`)}
          className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface/60 ${conversationId === c.conversationId ? 'bg-surface' : ''}`}
        >
          <Avatar src={c.displayAvatarUrl} name={c.displayName} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-semibold text-text">{c.displayName}</p>
              {c.lastMessageAt && (
                <span className="shrink-0 text-xs text-secondary">{timeAgo(c.lastMessageAt)}</span>
              )}
            </div>
            <p className={`truncate text-sm ${c.unreadCount > 0 ? 'font-medium text-text' : 'text-secondary'}`}>
              {c.myStatus === 'PENDING' ? (
                <span className="italic text-accent">{t('pending_conversation_label')}</span>
              ) : (
                <>
                  {c.lastMessageSenderUsername ? `${c.lastMessageSenderUsername}: ` : ''}
                  {c.lastMessageContent ?? ''}
                </>
              )}
            </p>
          </div>
          {c.unreadCount > 0 && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />}
        </button>
      ))}
    </div>
  );
};
