import { MOCK_USERS } from '../../../mocks/mockData';
import type { UpdateProfileRequest, UserProfile } from '../types/user.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
let store: UserProfile[] = [...MOCK_USERS];

export const userApi = {
  getProfile: async (username: string): Promise<UserProfile> => {
    await delay();
    // TODO: thay bằng api.get(`/users/${username}`).then(r => r.data)
    const found = store.find((u) => u.username === username);
    if (!found) throw new Error('User not found');
    return { ...found };
  },

  updateProfile: async (username: string, data: UpdateProfileRequest): Promise<UserProfile> => {
    await delay();
    // TODO: thay bằng api.patch('/users/me', data).then(r => r.data)
    store = store.map((u) => (u.username === username ? { ...u, ...data } : u));
    return store.find((u) => u.username === username)!;
  },

  follow: async (userId: string) => {
    await delay(200);
    // TODO: thay bằng api.post(`/follow/${userId}`)
    store = store.map((u) => (u.id === userId ? { ...u, followersCount: u.followersCount + 1 } : u));
  },

  unfollow: async (userId: string) => {
    await delay(200);
    // TODO: thay bằng api.delete(`/follow/${userId}`)
    store = store.map((u) => (u.id === userId ? { ...u, followersCount: Math.max(0, u.followersCount - 1) } : u));
  },

  getFollowers: async (_username: string): Promise<UserProfile[]> => {
    await delay();
    // TODO: thay bằng api.get(`/users/${_username}/followers`).then(r => r.data)
    return store.slice(1, 4);
  },

  getFollowing: async (_username: string): Promise<UserProfile[]> => {
    await delay();
    // TODO: thay bằng api.get(`/users/${_username}/following`).then(r => r.data)
    return store.filter((u) => u.isFollowing);
  },

  searchUsers: async (query: string): Promise<UserProfile[]> => {
    await delay(300);
    // TODO: thay bằng api.get('/users/search', { params: { q: query } }).then(r => r.data)
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return store.filter((u) => u.username.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q));
  },

  getSuggested: async (): Promise<UserProfile[]> => {
    await delay();
    // TODO: thay bằng api.get('/users/suggested').then(r => r.data)
    return store.filter((u) => !u.isFollowing).slice(0, 3);
  },
};
