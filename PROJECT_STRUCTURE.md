# ConnectHub — Frontend (React + TypeScript)

> Ứng dụng mạng xã hội kiểu Twitter/X: đăng bài, follow, nhắn tin realtime, thông báo, tìm kiếm...
> Đây là repo **frontend**, tổ chức theo **feature-based architecture** (chia theo tính năng thay vì theo loại file).

## 1. Thông tin kỹ thuật chung

| Hạng mục | Chi tiết |
|---|---|
| Framework | React 18 + TypeScript, build bằng Vite |
| Routing | `react-router-dom` v6 (khai báo dạng `RouteObject[]` + `useRoutes`) |
| State management | Redux Toolkit (`app/store.ts`) cho `auth`, kết hợp React Context cho các phần khác (`AuthContext`, `ConversationContext`, `ThemeContext`) |
| HTTP client | `axios` — có 2 instance: `axiosClient.ts` (có gắn Bearer token + tự refresh token khi 401) và `publicClient.ts` (không cần auth) |
| Đa ngôn ngữ | `src/i18n/` (i18n.ts, locales.ts, translations.ts) |
| Styling | dùng class-based (có `shared/utils/cn.ts` kiểu classnames helper) |
| Backend URL mặc định | `http://localhost:8080/api/v1` (đọc từ `VITE_API_URL`, xem `src/config/env.ts`) |
| WebSocket URL | `ws://localhost:8080/api/ws` (đọc từ `VITE_WS_URL`) — **chưa thấy code kết nối WebSocket thực tế trong `message` feature**, hiện dùng mock/polling |

⚠️ **Lưu ý quan trọng:** File zip chỉ chứa thư mục `src/`, **không có** `package.json`, `tsconfig.json`, `vite.config.ts`. Người nhận cần tự khởi tạo project Vite + React + TS rồi copy `src/` vào, hoặc xin thêm các file cấu hình gốc từ người gửi. Các package chắc chắn cần cài: `react`, `react-dom`, `react-router-dom`, `@reduxjs/toolkit`, `react-redux`, `axios`, và thư viện i18n đang dùng trong `i18n/i18n.ts`.

## 2. Trạng thái tích hợp API — RẤT QUAN TRỌNG

Đây là điểm người nhận việc cần biết ngay để không mất thời gian debug:

| Module | Trạng thái | Ghi chú |
|---|---|---|
| `features/auth` | ✅ **Đã nối API thật** qua `axiosClient` | Endpoint tại `config/endpoints.ts`: login, register, refresh token, logout, verify email, forgot/reset password |
| `features/post` | 🟡 **Mock data** (`mocks/mockData.ts`, lưu tạm trong RAM) | Mỗi hàm trong `postApi.ts` đều có comment `// TODO: thay bằng api...` chỉ rõ endpoint thật cần gọi |
| `features/user` | 🟡 **Mock data** | Tương tự, có sẵn TODO cho `GET /users/:username`, follow/unfollow, search... |
| `features/notification` | 🟡 **Mock data** | TODO cho `GET /notifications`, mark as read |
| `features/message` (chat) | 🟡 **Mock data**, chưa có WebSocket thật | TODO cho REST endpoints; STOMP/WebSocket client chưa được implement |
| `features/reply` | 🟡 **Mock data** | TODO tương ứng |
| `features/repost`, `reaction`, `hashtag`, `mention`, `search`, `follow` | ⚪ **Chưa implement** | Chỉ có file `index.ts` rỗng — coi như đang ở dạng khung, cần code từ đầu |

➡️ **Việc cần làm tiếp theo rõ ràng nhất:** thay từng hàm mock trong các file `*Api.ts` bằng lệnh gọi `axiosClient`/`publicClient` thật, theo đúng comment TODO đã có sẵn trong code — cấu trúc request/response đã được thiết kế khớp với các trang UI đang dùng.

## 3. Cây thư mục

```
src/
├── main.tsx, App.tsx, index.css, vite-env.d.ts     # entry point của ứng dụng
│
├── app/
│   ├── router.tsx          # khai báo toàn bộ route (RouteObject[]), có Guard cho từng nhóm
│   └── store.ts             # Redux store (hiện chỉ có reducer "auth")
│
├── config/
│   ├── axiosClient.ts       # instance có auth: tự gắn Bearer token, tự refresh token khi 401, queue request khi đang refresh
│   ├── publicClient.ts      # instance không cần auth (dùng cho API public)
│   ├── endpoints.ts         # danh sách URL API (auth, user, admin, post, search, notification)
│   └── env.ts                # đọc biến môi trường VITE_API_URL, VITE_WS_URL
│
├── constants/
│   ├── routes.ts             # hằng số đường dẫn route
│   ├── limits.ts              # giới hạn (độ dài input, số item/trang...)
│   ├── queryKeys.ts           # key cho React Query (nếu dùng) / cache
│   └── errorMessage.ts        # message lỗi dùng chung
│
├── contexts/
│   ├── ThemeContext.tsx      # chế độ sáng/tối (dark/light mode)
│   └── index.ts
│
├── i18n/
│   ├── i18n.ts, locales.ts, translations.ts   # đa ngôn ngữ
│
├── mocks/
│   └── mockData.ts            # toàn bộ dữ liệu giả (user, post, message, reply, notification...) — nguồn dữ liệu cho các module đang ở trạng thái mock
│
├── features/                    # ⭐ logic nghiệp vụ, chia theo tính năng
│   │
│   ├── auth/                     # ĐĂNG NHẬP / ĐĂNG KÝ — đã nối API thật
│   │   ├── api/authApi.ts        # login, register, logout, forgot/reset password, verify email
│   │   ├── service/authService.ts
│   │   ├── store/authSlice.ts     # Redux slice: accessToken, refreshToken, user
│   │   ├── store/AuthContext.tsx  # context bổ sung cho auth
│   │   ├── hooks/useAuth.ts
│   │   └── types/auth.types.ts
│   │
│   ├── post/                     # BÀI ĐĂNG — mock data
│   │   ├── api/postApi.ts        # getFeed (cursor pagination), getUserPosts, getBookmarks, getPost,
│   │   │                         # createPost, deletePost, like/unlike, repost/unrepost, bookmark/unbookmark
│   │   ├── components/           # PostCard, PostList, PostForm, MediaGrid, CreatePostModal
│   │   ├── hooks/                # useFeed, usePostDetail, usePostActions, useCreatePost, useBookmarks, useUserPosts
│   │   └── types/post.types.ts
│   │
│   ├── reply/                    # BÌNH LUẬN bài đăng — mock data
│   │   ├── api/replyApi.ts       # getReplies, createReply, deleteReply, likeReply
│   │   ├── replies/               # ReplyList, ReplyForm, ReplyItem (components)
│   │   ├── hooks/useReplies.ts
│   │   └── types/reply.types.ts
│   │
│   ├── user/                     # HỒ SƠ NGƯỜI DÙNG — mock data
│   │   ├── api/userApi.ts        # getProfile, updateProfile, follow/unfollow, getFollowers/Following,
│   │   │                         # searchUsers, getSuggested
│   │   ├── service/userService.ts
│   │   ├── components/           # EditProfileModal, SuggestedUsers, UserListItem
│   │   └── types/user.types.ts
│   │
│   ├── message/                  # NHẮN TIN REALTIME — mock data, CHƯA có WebSocket thật
│   │   ├── api/messageApi.ts     # getConversations, getMessages, sendMessage, recallMessage,
│   │   │                         # reactToMessage, markAsRead
│   │   ├── components/           # ConversationList, MessageBubble, MessageInput
│   │   ├── hooks/                # useConversations, useChat
│   │   ├── store/ConversationContext.tsx
│   │   ├── utils/attachment.ts   # xử lý file đính kèm
│   │   └── types/message.types.ts
│   │
│   ├── notification/              # THÔNG BÁO — mock data
│   │   ├── api/notificationApi.ts # getNotifications, markAsRead, markAllAsRead
│   │   ├── components/            # NotificationDropdown, NotificationItem, NotificationIcon
│   │   ├── hooks/useNotifications.ts
│   │   ├── store/notificationSlice.ts
│   │   └── types/notification.types.ts
│   │
│   ├── media/mediaService.ts      # xử lý upload/preview media (ảnh, video)
│   │
│   └── repost/, reaction/, hashtag/, mention/, search/, follow/
│                                   # ⚪ CHƯA IMPLEMENT — chỉ có index.ts rỗng, cần code từ đầu
│                                   # (một phần logic follow/repost/reaction tạm nằm chung trong post/userApi)
│
├── pages/                          # các trang cấp route (page-level components)
│   ├── HomePage.tsx                # trang chủ / feed
│   ├── LoginPage.tsx, RegisterPage.tsx, ForgotPasswordPage.tsx, VerifyEmailPage.tsx
│   ├── ProfilePage.tsx             # trang hồ sơ user (theo :username)
│   ├── FollowListPage.tsx          # danh sách followers/following
│   ├── PostDetailPage.tsx          # chi tiết 1 bài đăng + replies
│   ├── SearchPage.tsx
│   ├── NotificationsPage.tsx
│   ├── BookmarksPage.tsx
│   ├── MessagesPage.tsx            # layout danh sách hội thoại, con là ChatPage theo :conversationId
│   ├── ChatPage.tsx
│   ├── ForbiddenPage.tsx (403), NotFoundPage.tsx (404)
│   ├── admin/AdminUsersPage.tsx    # trang quản trị user — chỉ ROLE_ADMIN truy cập được
│   └── settings/
│       ├── SettingsLayout.tsx, SettingsIndexRedirect.tsx
│       ├── AccountSettingsPage.tsx, PrivacySettingsPage.tsx
│       ├── ThemeSettingsPage.tsx, SecuritySettingsPage.tsx
│
└── shared/                          # thành phần & tiện ích dùng chung toàn app
    ├── components/
    │   ├── ui/         # Button, Input, Textarea, Modal, ConfirmModal, Toast, Badge, Avatar,
    │   │               # Dropdown, Tabs, Toggle, Skeleton, Spinner, EmptyState, ErrorState, IconButton, ScrollFade
    │   ├── layout/      # Navbar, Sidebar, BottomNav, MainLayout (layout khung chính), TrendingWidget
    │   ├── icons/Icons.tsx
    │   └── guards/
    │       ├── AuthGuard.tsx    # chặn route cần đăng nhập
    │       ├── GuestGuard.tsx   # chặn route chỉ dành cho khách (đã login thì redirect về "/")
    │       └── RoleGuard.tsx    # chặn theo role (VD: allowedRoles={['ROLE_ADMIN']})
    ├── hooks/           # useDebounce, useInfiniteScroll, useLocalStorage, useClickOutside, useMediaQuery
    ├── types/           # api.types.ts (CursorResponse...), common.types.ts
    └── utils/            # cn.ts (ghép className), date.ts (format ngày giờ)
```

## 4. Sơ đồ route (đã cấu hình sẵn trong `app/router.tsx`)

```
/login, /register, /forgot-password        → chỉ khách (GuestGuard)
/verify-email                               → cần đăng nhập, không dùng layout chính

/  (MainLayout, cần đăng nhập)
├── /                                       → Trang chủ (feed)
├── /profile/:username                      → Hồ sơ user
├── /profile/:username/followers            → Danh sách followers
├── /profile/:username/following            → Danh sách following
├── /post/:postId                           → Chi tiết bài đăng
├── /notifications                          → Thông báo
├── /search                                 → Tìm kiếm
├── /bookmarks                              → Bài đã lưu
├── /messages                               → Danh sách hội thoại
│   └── /messages/:conversationId           → Cửa sổ chat
├── /settings                               → Layout cài đặt
│   ├── /settings/account
│   ├── /settings/privacy
│   ├── /settings/theme
│   └── /settings/security
└── /admin/users                            → Chỉ ROLE_ADMIN (RoleGuard)

/403 → Forbidden, * → Not Found
```

## 5. Việc gợi ý cho người tiếp nhận (checklist bắt đầu)

1. Xin thêm `package.json`, `tsconfig.json`, `vite.config.ts` (hoặc tự khởi tạo Vite + React + TS mới rồi copy `src/` vào).
2. Dựng file `.env` với `VITE_API_URL` và `VITE_WS_URL` trỏ đến backend Spring Boot (mặc định backend chạy ở `localhost:8080/api/v1`, khớp với module **ConnectHub** — Spring Boot chat backend đang phát triển song song).
3. Lần lượt thay mock API bằng API thật, theo thứ tự ưu tiên gợi ý:
   - `user` (profile, follow) → cần cho hầu hết các trang
   - `post` (feed, CRUD, like, bookmark)
   - `notification`
   - `reply`
   - `message` — phần phức tạp nhất, cần thêm tích hợp WebSocket/STOMP thực (hiện chỉ có REST mock, khớp với backend ConnectHub đang dùng STOMP)
4. Implement các module còn trống: `repost`, `reaction`, `hashtag`, `mention`, `search`, `follow` (hiện là các feature rỗng, cần bổ sung `api/`, `hooks/`, `components/`, `types/` theo đúng pattern các feature đã có).
5. Kiểm tra lại `endpoints.ts` — hiện thiếu endpoint cho `message`, `reply`, `hashtag`, `mention`, `reaction`, `repost` vì các module này còn ở dạng mock, cần bổ sung khi nối API thật.

---
*Tài liệu này được tạo tự động từ việc phân tích mã nguồn thực tế trong file zip, không phải suy đoán — mọi mô tả API/mock ở trên đều đối chiếu trực tiếp với nội dung code.*
