import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { messageApi } from '../api/messageApi';
import type { Conversation } from '../types/message.types';

interface ConversationContextValue {
  conversations: Conversation[];
  isLoading: boolean;
  totalUnread: number;
  markConversationRead: (conversationId: string) => void;
  refetch: () => Promise<void>;
}

const ConversationContext = createContext<ConversationContextValue | null>(null);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      setConversations(await messageApi.getConversations());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalUnread = useMemo(() => conversations.reduce((sum, c) => sum + c.unreadCount, 0), [conversations]);

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)));
    messageApi.markAsRead(conversationId);
  }, []);

  const value = useMemo(
    () => ({ conversations, isLoading, totalUnread, markConversationRead, refetch: fetchAll }),
    [conversations, isLoading, totalUnread, markConversationRead, fetchAll]
  );

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
};

export const useConversations = () => {
  const ctx = useContext(ConversationContext);
  if (!ctx) throw new Error('useConversations must be used within ConversationProvider');
  return ctx;
};
