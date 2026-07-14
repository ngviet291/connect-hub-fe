import { useState } from 'react';
import { Outlet, useMatch, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ConversationList } from '../features/message/components/ConversationList';
import { CreateGroupModal } from '../features/message/components/CreateGroupModal';
import { IconButton } from '../shared/components/ui/IconButton';
import { MailIcon, PlusSquareIcon } from '../shared/components/icons/Icons';

export const MessagesPage = () => {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  // "new" là route con riêng (sibling của ":conversationId"), không match
  // vào param conversationId — cần check thêm để cũng render <Outlet /> (ChatPage)
  // thay vì màn hình rỗng "chọn 1 cuộc trò chuyện".
  const isNewChatRoute = !!useMatch('/messages/new');
  const hasActiveChat = !!conversationId || isNewChatRoute;
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  return (
    <div className="flex h-full animate-fade-in">
      <div className={`w-full shrink-0 overflow-y-auto border-r border-border sm:w-72 ${hasActiveChat ? 'hidden sm:block' : 'block'}`}>
        <div className="sticky top-0 hidden items-center justify-between border-b border-border bg-surface/85 px-4 py-3.5 backdrop-blur-md md:flex">
          <h1 className="text-xl font-bold text-text">{t('nav_messages')}</h1>
          <IconButton
            icon={<PlusSquareIcon size={20} />}
            size="sm"
            onClick={() => setShowCreateGroup(true)}
            aria-label={t('create_group_title')}
          />
        </div>
        <ConversationList />
      </div>
      <div className={`flex-1 ${hasActiveChat ? 'block' : 'hidden sm:block'}`}>
        {hasActiveChat ? (
          <Outlet />
        ) : (
          <div className="hidden h-full flex-col items-center justify-center gap-3 text-secondary sm:flex">
            <MailIcon size={40} />
            <p>{t('messages_empty_hint')}</p>
          </div>
        )}
      </div>
      <CreateGroupModal isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} />
    </div>
  );
};