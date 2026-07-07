import { MOCK_POSTS } from '../../../mocks/mockData';
import type { CursorResponse } from '../../../shared/types/api.types';
import type { CreatePostRequest, Post } from '../types/post.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// State mock giữ trong memory (reset khi F5)
let mockPosts: Post[] = [...MOCK_POSTS];
const PAGE_SIZE = 4;

export const postApi = {
  getFeed: async (cursor?: string, size = PAGE_SIZE): Promise<CursorResponse<Post>> => {
    await delay();
    // TODO: thay bằng api.get('/posts/feed', { params: { cursor, size } }).then(r => r.data)
    const startIndex = cursor ? mockPosts.findIndex((p) => p.id === cursor) + 1 : 0;
    const page = mockPosts.slice(startIndex, startIndex + size);
    const hasNext = startIndex + size < mockPosts.length;
    return { content: page, nextCursor: hasNext ? page[page.length - 1]?.id ?? null : null, hasNext };
  },

  getUserPosts: async (username: string): Promise<Post[]> => {
    await delay();
    // TODO: thay bằng api.get(`/users/${username}/posts`).then(r => r.data)
    return mockPosts.filter((p) => p.user.username === username);
  },

  getBookmarks: async (): Promise<Post[]> => {
    await delay();
    // TODO: thay bằng api.get('/posts/bookmarks').then(r => r.data)
    return mockPosts.filter((p) => p.isBookmarked);
  },

  getPost: async (id: string): Promise<Post> => {
    await delay(300);
    // TODO: thay bằng api.get(`/posts/${id}`).then(r => r.data)
    const post = mockPosts.find((p) => p.id === id);
    if (!post) throw new Error('Post not found');
    return post;
  },

  createPost: async (data: CreatePostRequest): Promise<Post> => {
    await delay();
    // TODO: thay bằng api.post('/posts', data).then(r => r.data)
    const newPost: Post = {
      id: `post-${Date.now()}`,
      content: data.content,
      visibility: data.visibility ?? 'PUBLIC',
      createdAt: new Date().toISOString(),
      user: { id: 'user-001', username: 'as_dev', displayName: 'As Dev' },
      media: data.media,
      likeCount: 0,
      commentCount: 0,
      repostCount: 0,
      isLiked: false,
      isReposted: false,
      isBookmarked: false,
    };
    mockPosts = [newPost, ...mockPosts];
    return newPost;
  },

  deletePost: async (id: string) => {
    await delay(200);
    // TODO: thay bằng api.delete(`/posts/${id}`)
    mockPosts = mockPosts.filter((p) => p.id !== id);
  },

  likePost: async (_id: string) => {
    await delay(200);
    // TODO: thay bằng api.post(`/posts/${_id}/reactions`)
  },

  unlikePost: async (_id: string) => {
    await delay(200);
    // TODO: thay bằng api.delete(`/posts/${_id}/reactions`)
  },

  repost: async (_id: string) => {
    await delay(200);
    // TODO: thay bằng api.post(`/posts/${_id}/repost`)
  },

  unrepost: async (_id: string) => {
    await delay(200);
    // TODO: thay bằng api.delete(`/posts/${_id}/repost`)
  },

  bookmark: async (_id: string) => {
    await delay(150);
    // TODO: thay bằng api.post(`/posts/${_id}/bookmark`)
    mockPosts = mockPosts.map((p) => (p.id === _id ? { ...p, isBookmarked: true } : p));
  },

  unbookmark: async (_id: string) => {
    await delay(150);
    // TODO: thay bằng api.delete(`/posts/${_id}/bookmark`)
    mockPosts = mockPosts.map((p) => (p.id === _id ? { ...p, isBookmarked: false } : p));
  },
};
