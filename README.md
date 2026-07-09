# ConnectHub — Frontend

Mạng xã hội lấy cảm hứng thiết kế từ Threads (Meta), xây dựng bằng React 19 + TypeScript + Vite + Tailwind CSS v4.

## Cài đặt

```bash
npm install
npm run dev
```

Ứng dụng chạy tại `http://localhost:5173`.

> Toàn bộ dữ liệu hiện đang dùng **mock API** (trong `src/features/*/api` và `src/mocks/mockData.ts`) với độ trễ giả lập, để bạn có thể chạy và xem UI ngay cả khi backend chưa sẵn sàng. Mỗi hàm mock đều có reply `// TODO: thay bằng api.xxx(...)` chỉ rõ cách nối vào REST API thật (đã cấu hình sẵn `axios` instance tại `src/config/axios.ts`, tự đính kèm Bearer token).

## Tech stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4 (theme tokens qua CSS variables, dark mode qua class `.dark`)
- React Router DOM v6
- Axios (đã cấu hình interceptor, sẵn sàng khi có backend)
- Context API cho Auth (`features/auth/store/AuthContext`) và Theme (`contexts/ThemeContext`)

## Kiến trúc thư mục (feature-based / clean architecture)

```
src/
  app/                 # router, (chỗ mở rộng store/query client nếu cần)
  config/              # axios instance, biến môi trường
  constants/           # routes, limits, query keys
  contexts/            # ThemeProvider (+ re-export AuthProvider)
  features/
    auth/              # login/register/forgot-password/verify-email
    post/              # feed, composer, post card, media grid, hooks
    reply/           # Trả lời
    user/              # profile, follow, suggested users
    notification/      # thông báo
    message/           # nhắn tin (conversations + chat)
    ...                # search, hashtag, mention, reaction, repost, story (sẵn khung mở rộng)
  mocks/               # dữ liệu mẫu dùng chung cho mock API
  pages/                # 1 file / 1 route (kể cả sub-route settings/*)
  services/media/       # upload ảnh/video (mock, có TODO nối API thật)
  shared/
    components/
      ui/              # Button, Input, Modal, Dropdown, Skeleton, Toast, Toggle, Tabs...
      layout/          # MainLayout, Sidebar, Navbar, BottomNav, TrendingWidget
      icons/           # bộ icon SVG tự vẽ (không dùng asset của Threads)
      guards/          # AuthGuard, GuestGuard
    hooks/             # useDebounce, useInfiniteScroll, useClickOutside, useMediaQuery...
    types/, utils/
```

## Tính năng đã hoàn thiện

- **Auth**: đăng nhập, đăng ký, quên mật khẩu, xác thực email (form OTP 6 số)
- **Feed**: infinite scroll, tạo bài viết (text/ảnh/video), like, reply, repost, bookmark, share (UI), trang chi tiết bài viết + bình luận
- **Người dùng**: trang cá nhân, chỉnh sửa hồ sơ, danh sách followers/following, tìm kiếm người dùng, gợi ý theo dõi
- **Thông báo**: trang thông báo, dropdown thông báo trên navbar, badge số chưa đọc
- **Nhắn tin**: danh sách hội thoại, màn hình chat, UI sẵn sàng nối realtime (WebSocket) sau này
- **Cài đặt**: tài khoản, quyền riêng tư, giao diện (theme), bảo mật (đổi mật khẩu, 2FA toggle)
- **Theme**: sáng/tối, tự nhận diện theme hệ thống lần đầu, lưu lựa chọn vào `localStorage`, không bị nháy sai theme khi tải trang (script inline trong `index.html`)
- Skeleton loading, empty state, error state (có nút thử lại) cho toàn bộ danh sách dữ liệu
- Responsive: rail điều hướng bên trái (thu gọn ở tablet, đầy đủ nhãn ở desktop), thanh điều hướng dưới cùng trên mobile, cột gợi ý bên phải ẩn dưới `xl`

## Nối vào Backend thật

1. Cập nhật `.env` (copy từ `.env.example`) trỏ `VITE_API_URL` đến backend Spring Boot của bạn.
2. Trong mỗi file `features/*/api/*.ts`, thay phần mock (`await delay(); return ...`) bằng lệnh gọi `api.get/post/...` đã có sẵn dòng TODO gợi ý endpoint tương ứng.
3. `src/config/axios.ts` đã tự đính kèm `Authorization: Bearer <accessToken>` từ `localStorage`, chỉ cần trả đúng `{ accessToken, user }` từ endpoint `/auth/login`, `/auth/register`.
