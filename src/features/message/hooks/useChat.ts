import { useCallback, useEffect, useState } from 'react';
import { messageApi } from '../api/messageApi';
import type { ChatMessage, MessageAttachment } from '../types/message.types';
import { useAuth } from '../../auth/store/AuthContext';
import { useConversations } from './useConversations';

export const useChat = (conversationId: string | undefined) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { markConversationRead } = useConversations();
  const { user } = useAuth();

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      setMessages(await messageApi.getMessages(conversationId));
      markConversationRead(conversationId);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async (content: string, media?: MessageAttachment[], replyToId?: string) => {
    if (!conversationId || (!content.trim() && !media?.length)) return;
    setIsSending(true);
    try {
      const msg = await messageApi.sendMessage(conversationId, content.trim(), media, replyToId);
      setMessages((prev) => [...prev, msg]);
    } finally {
      setIsSending(false);
    }
  };

  const recallMessage = async (messageId: string) => {
    if (!conversationId) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, content: '', media: undefined, recalled: true } : m)),
    );
    await messageApi.recallMessage(conversationId, messageId);
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
    if (!conversationId || !user) return;
    const updated = await messageApi.reactToMessage(conversationId, messageId, emoji, user.id);
    if (updated) setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
  };

  return { messages, isLoading, isSending, sendMessage, recallMessage, reactToMessage };
};
