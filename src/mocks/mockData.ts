import type { AuthUser } from '../features/auth/types/auth.types';
import type { Post } from '../features/post/types/post.types';
import type { UserProfile } from '../features/user/types/user.types';
import type { CommentItem } from '../features/reply/types/comment.types';
import type { AppNotification } from '../features/notification/types/notification.types';
import type { Conversation, ChatMessage } from '../features/message/types/message.types';

export const MOCK_USER: AuthUser = {
  id: 'user-001',
  username: 'as_dev',
  email: 'as@connecthub.dev',
  displayName: 'As Dev',
  avatarUrl: undefined,
  bio: 'Full-stack developer | Spring Boot & React',
  roles: ['ROLE_ADMIN'], // TODO: đổi lại 'ROLE_USER' để test luồng phân quyền user thường
};

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-001',
    username: 'as_dev',
    displayName: 'As Dev',
    bio: 'Full-stack developer | Spring Boot & React | Xây ConnectHub 🚀',
    website: 'connecthub.dev',
    location: 'Hồ Chí Minh, Việt Nam',
    roles: ["ROLE_USER"],
    createdAt: '2023-04-01T00:00:00.000Z',
    followersCount: 128,
    followingCount: 64,
    postsCount: 12,
    isFollowing: false,
    isVerified: true,
  },
  {
    id: 'user-002',
    username: 'jane_doe',
    displayName: 'Jane Doe',
    bio: 'UI/UX Designer • Nghiện cà phê ☕',
    location: 'Đà Nẵng',
    roles: ["ROLE_ADMIN"],
    createdAt: '2022-11-12T00:00:00.000Z',
    followersCount: 320,
    followingCount: 120,
    postsCount: 45,
    isFollowing: true,
  },
  {
    id: 'user-003',
    username: 'john_smith',
    displayName: 'John Smith',
    bio: 'Backend engineer @ ConnectHub. Java • Spring • Kafka',
    roles: ["ROLE_USER"],
    createdAt: '2023-01-20T00:00:00.000Z',
    followersCount: 88,
    followingCount: 40,
    postsCount: 7,
    isFollowing: false,
  },
  {
  id: "user-004",
  username: "linh.tran",
  displayName: "Linh Trần",
  bio: "Product Manager • Mèo lover 🐱",
  roles: ["ROLE_USER"],
  createdAt: "2023-01-15T00:00:00.000Z",
  followersCount: 512,
  followingCount: 210,
  postsCount: 88,
  isFollowing: false,
  isVerified: true,
},
  {
  id: "user-005",
  username: "minh.nguyen",
  displayName: "Minh Nguyễn",
  bio: "Đam mê bóng đá ⚽ và du lịch",
  roles: ["ROLE_USER"],
  createdAt: "2023-03-20T00:00:00.000Z",
  followersCount: 76,
  followingCount: 300,
  postsCount: 30,
  isFollowing: true,
},
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'post-001',
    content: 'Vừa hoàn thành refactor PostService — tách HashtagService và MentionService ra riêng, code sạch hơn hẳn 🚀',
    visibility: 'PUBLIC',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    user: { id: 'user-001', username: 'as_dev', displayName: 'As Dev' },
    likeCount: 12,
    commentCount: 3,
    repostCount: 1,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
  },
  {
    id: 'post-002',
    content: 'ConnectHub frontend đã có giao diện lấy cảm hứng từ Threads, dùng React 19 + Tailwind v4. Dark/Light mode mượt mà luôn 😄',
    visibility: 'PUBLIC',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    user: { id: 'user-002', username: 'jane_doe', displayName: 'Jane Doe' },
    media: [{ id: 'm1', type: 'IMAGE', url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=900&q=80' }],
    likeCount: 25,
    commentCount: 7,
    repostCount: 4,
    isLiked: true,
    isReposted: false,
    isBookmarked: true,
  },
  {
    id: 'post-003',
    content: 'Spring Boot + TransactionTemplate để tách I/O khỏi transaction là một pattern rất hay. Không cần self-injection phức tạp nữa.',
    visibility: 'PUBLIC',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: { id: 'user-003', username: 'john_smith', displayName: 'John Smith' },
    likeCount: 8,
    commentCount: 2,
    repostCount: 0,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
  },
  {
    id: 'post-004',
    content: 'Cursor-based pagination > offset pagination cho social feed. Không bị duplicate khi có bài mới insert vào 📌',
    visibility: 'PUBLIC',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    user: { id: 'user-001', username: 'as_dev', displayName: 'As Dev' },
    likeCount: 19,
    commentCount: 5,
    repostCount: 2,
    isLiked: false,
    isReposted: true,
    isBookmarked: false,
  },
  {
    id: 'post-005',
    content: 'Dark mode với màu #7C3AED nhìn cực đẹp 🎨 ConnectHub sắp launch rồi!',
    visibility: 'PUBLIC',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: { id: 'user-002', username: 'jane_doe', displayName: 'Jane Doe' },
    media: [
      { id: 'm2', type: 'IMAGE', url: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=900&q=80' },
      { id: 'm3', type: 'IMAGE', url: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=900&q=80' },
    ],
    likeCount: 41,
    commentCount: 11,
    repostCount: 6,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
  },
  {
    id: 'post-006',
    content: 'Bàn thắng đẹp mắt cuối tuần này! Ai xem trận vừa rồi chưa? ⚽🔥',
    visibility: 'PUBLIC',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    user: { id: 'user-005', username: 'minh.nguyen', displayName: 'Minh Nguyễn' },
    likeCount: 63,
    commentCount: 14,
    repostCount: 9,
    isLiked: true,
    isReposted: false,
    isBookmarked: false,
  },
];

export const MOCK_COMMENTS: Record<string, CommentItem[]> = {
  'post-001': [
    {
      id: 'c1',
      postId: 'post-001',
      content: 'Refactor nhìn clean quá anh ơi 👏',
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      user: { id: 'user-002', username: 'jane_doe', displayName: 'Jane Doe' },
      likeCount: 2,
      isLiked: false,
    },
    {
      id: 'c2',
      postId: 'post-001',
      content: 'Có repo tham khảo không share em với 🙏',
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      user: { id: 'user-003', username: 'john_smith', displayName: 'John Smith' },
      likeCount: 0,
      isLiked: false,
    },
  ],
};

export const MOCK_TRENDS = [
  { tag: 'reactjs', postCount: 12500 },
  { tag: 'springboot', postCount: 8300 },
  { tag: 'connecthub', postCount: 4210 },
  { tag: 'typescript', postCount: 15600 },
  { tag: 'tailwindcss', postCount: 6720 },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'LIKE',
    message: 'đã thích bài viết của bạn',
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    actor: { id: 'user-002', username: 'jane_doe', displayName: 'Jane Doe' },
    targetPostId: 'post-001',
  },
  {
    id: 'n2',
    type: 'COMMENT',
    message: 'đã bình luận về bài viết của bạn',
    isRead: false,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    actor: { id: 'user-003', username: 'john_smith', displayName: 'John Smith' },
    targetPostId: 'post-001',
  },
  {
    id: 'n3',
    type: 'FOLLOW',
    message: 'đã bắt đầu theo dõi bạn',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    actor: { id: 'user-004', username: 'linh.tran', displayName: 'Linh Trần' },
  },
  {
    id: 'n4',
    type: 'REPOST',
    message: 'đã chia sẻ lại bài viết của bạn',
    isRead: true,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    actor: { id: 'user-005', username: 'minh.nguyen', displayName: 'Minh Nguyễn' },
    targetPostId: 'post-004',
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participant: { id: 'user-002', username: 'jane_doe', displayName: 'Jane Doe' },
    lastMessage: 'Chốt design mới lúc chiều nhé!',
    lastMessageAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    participant: { id: 'user-003', username: 'john_smith', displayName: 'John Smith' },
    lastMessage: 'Ok để mình check lại API',
    lastMessageAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    participant: { id: 'user-004', username: 'linh.tran', displayName: 'Linh Trần' },
    lastMessage: 'Cảm ơn bạn nhiều 🙏',
    lastMessageAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
];

export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    { id: 'm1', conversationId: 'conv-1', senderId: 'user-002', content: 'Chào As, review giúp mình design mới nhé', createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString() },
    { id: 'm2', conversationId: 'conv-1', senderId: 'user-001', content: 'Ok để mình xem qua', createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
    { id: 'm3', conversationId: 'conv-1', senderId: 'user-002', content: 'Chốt design mới lúc chiều nhé!', createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString() },
  ],
  'conv-2': [
    { id: 'm4', conversationId: 'conv-2', senderId: 'user-003', content: 'API feed bị lỗi cursor rồi', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { id: 'm5', conversationId: 'conv-2', senderId: 'user-001', content: 'Ok để mình check lại API', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  ],
  'conv-3': [
    { id: 'm6', conversationId: 'conv-3', senderId: 'user-004', content: 'Cảm ơn bạn nhiều 🙏', createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() },
  ],
};
