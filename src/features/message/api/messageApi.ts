import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_USER } from '../../../mocks/mockData';
import type { ChatMessage, Conversation, MessageAttachment } from '../types/message.types';
import i18n from '../../../i18n/i18n';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

let conversations: Conversation[] = [...MOCK_CONVERSATIONS];
const messages: Record<string, ChatMessage[]> = JSON.parse(JSON.stringify(MOCK_MESSAGES));

export const messageApi = {
  getConversations: async (): Promise<Conversation[]> => {
    await delay();
    // TODO: api.get('/conversations').then(r => r.data)
    return [...conversations].sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt));
  },

  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    await delay(300);
    // TODO: api.get(`/conversations/${conversationId}/messages`).then(r => r.data)
    return messages[conversationId] ? [...messages[conversationId]] : [];
  },

  sendMessage: async (
    conversationId: string,
    content: string,
    media?: MessageAttachment[],
    replyToId?: string,
  ): Promise<ChatMessage> => {
    await delay(250);
    // TODO: api.post(`/conversations/${conversationId}/messages`, { content, media, replyToId }).then(r => r.data)
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: MOCK_USER.id,
      content,
      media,
      replyToId,
      createdAt: new Date().toISOString(),
    };
    messages[conversationId] = [...(messages[conversationId] ?? []), msg];
    const lastMessage = content || (media?.length ? (media[0].type === 'VIDEO' ? `📹 ${i18n.t('media_preview_video')}` : `📷 ${i18n.t('media_preview_image')}`) : '');
    conversations = conversations.map((c) =>
      c.id === conversationId ? { ...c, lastMessage, lastMessageAt: msg.createdAt } : c
    );
    return msg;
  },

  recallMessage: async (conversationId: string, messageId: string): Promise<void> => {
    await delay(200);
    // TODO: api.delete(`/conversations/${conversationId}/messages/${messageId}`)
    messages[conversationId] = (messages[conversationId] ?? []).map((m) =>
      m.id === messageId ? { ...m, content: '', media: undefined, recalled: true } : m
    );
  },

  reactToMessage: async (conversationId: string, messageId: string, emoji: string, userId: string): Promise<ChatMessage | undefined> => {
    await delay(150);
    // TODO: api.post(`/conversations/${conversationId}/messages/${messageId}/reactions`, { emoji })
    let updated: ChatMessage | undefined;
    messages[conversationId] = (messages[conversationId] ?? []).map((m) => {
      if (m.id !== messageId) return m;
      const existing = m.reactions ?? [];
      const already = existing.find((r) => r.userId === userId && r.emoji === emoji);
      const reactions = already
        ? existing.filter((r) => !(r.userId === userId && r.emoji === emoji))
        : [...existing.filter((r) => r.userId !== userId), { emoji, userId }];
      updated = { ...m, reactions };
      return updated;
    });
    return updated;
  },

  markAsRead: async (conversationId: string) => {
    await delay(150);
    conversations = conversations.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c));
  },
};
