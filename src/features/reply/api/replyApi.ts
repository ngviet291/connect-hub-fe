import { MOCK_REPLIES } from '../../../mocks/mockData';
import { MOCK_USER } from '../../../mocks/mockData';
import type { ReplyItem, CreateReplyRequest } from '../types/reply.types';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

const store: Record<string, ReplyItem[]> = { ...MOCK_REPLIES };

export const replyApi = {
  getReplies: async (postId: string): Promise<ReplyItem[]> => {
    await delay();
    return store[postId] ? [...store[postId]] : [];
  },

  createReply: async ({ postId, content }: CreateReplyRequest): Promise<ReplyItem> => {
    await delay(300);

    const reply: ReplyItem = {
      id: `r-${Date.now()}`,
      postId,
      content,
      createdAt: new Date().toISOString(),
      user: {
        id: MOCK_USER.id,
        username: MOCK_USER.username,
        displayName: MOCK_USER.displayName,
        avatarUrl: MOCK_USER.avatarUrl,
      },
      likeCount: 0,
      isLiked: false,
    };

    store[postId] = [...(store[postId] ?? []), reply];

    return reply;
  },

  deleteReply: async (postId: string, replyId: string) => {
    await delay(200);
    store[postId] = (store[postId] ?? []).filter((r) => r.id !== replyId);
  },

  likeReply: async (_replyId: string) => {
    await delay(150);
  },
};