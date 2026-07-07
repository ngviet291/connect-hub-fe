import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar } from '../shared/components/ui/Avatar';
import { MessageSkeleton } from '../shared/components/ui/Skeleton';
import { ArrowLeftIcon } from '../shared/components/icons/Icons';
import { MOCK_CONVERSATIONS } from '../mocks/mockData';
import { MessageBubble } from '../features/message/components/MessageBubble';
import { MessageInput } from '../features/message/components/MessageInput';
import { useChat } from '../features/message/hooks/useChat';
import type { ChatMessage, MessageAttachment } from '../features/message/types/message.types';

export const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { messages, isLoading, isSending, sendMessage, recallMessage, reactToMessage } = useChat(conversationId);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversation = MOCK_CONVERSATIONS.find((c) => c.id === conversationId);
  const participant = conversation?.participant ?? { id: '', username: '', displayName: '?' };

  const messageById = useMemo(() => new Map(messages.map((m) => [m.id, m])), [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (text: string, media?: MessageAttachment[]) => {
    sendMessage(text, media, replyingTo?.id);
    setReplyingTo(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={() => navigate('/messages')} className="cursor-pointer rounded-full p-1.5 hover:bg-surface-hover md:hidden">
          <ArrowLeftIcon size={20} />
        </button>
        {conversation && (
          <button
            onClick={() => navigate(`/profile/${conversation.participant.username}`)}
            className="flex cursor-pointer items-center gap-3 text-left"
          >
            <Avatar src={conversation.participant.avatarUrl} name={conversation.participant.displayName} size="sm" />
            <div>
              <p className="font-semibold text-text">{conversation.participant.displayName}</p>
              <p className="text-xs text-secondary">@{conversation.participant.username}</p>
            </div>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
            <MessageSkeleton align="left" />
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                participant={participant}
                repliedMessage={m.replyToId ? messageById.get(m.replyToId) : undefined}
                onReply={setReplyingTo}
                onRecall={recallMessage}
                onReact={reactToMessage}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <MessageInput
        onSend={handleSend}
        disabled={isSending}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
};
