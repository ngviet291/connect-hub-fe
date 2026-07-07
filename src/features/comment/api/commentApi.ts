import { MOCK_COMMENTS } from '../../../mocks/mockData';
import { MOCK_USER } from '../../../mocks/mockData';
import type { CommentItem, CreateCommentRequest } from '../types/comment.types';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

const store: Record<string, CommentItem[]> = { ...MOCK_COMMENTS };

export const commentApi = {
  getComments: async (postId: string): Promise<CommentItem[]> => {
    await delay();
    // TODO: thay bằng api.get(`/posts/${postId}/comments`).then(r => r.data)
    return store[postId] ? [...store[postId]] : [];
  },

  createComment: async ({ postId, content }: CreateCommentRequest): Promise<CommentItem> => {
    await delay(300);
    // TODO: thay bằng api.post(`/posts/${postId}/comments`, { content }).then(r => r.data)
    const comment: CommentItem = {
      id: `c-${Date.now()}`,
      postId,
      content,
      createdAt: new Date().toISOString(),
      user: { id: MOCK_USER.id, username: MOCK_USER.username, displayName: MOCK_USER.displayName, avatarUrl: MOCK_USER.avatarUrl },
      likeCount: 0,
      isLiked: false,
    };
    store[postId] = [...(store[postId] ?? []), comment];
    return comment;
  },

  deleteComment: async (postId: string, commentId: string) => {
    await delay(200);
    // TODO: thay bằng api.delete(`/comments/${commentId}`)
    store[postId] = (store[postId] ?? []).filter((c) => c.id !== commentId);
  },

  likeComment: async (_commentId: string) => {
    await delay(150);
    // TODO: api.post(`/comments/${_commentId}/reactions`)
  },
};
