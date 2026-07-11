import { BrowserRouter, useRoutes, type RouteObject } from "react-router-dom";
import { AuthGuard } from "../shared/components/guards/AuthGuard";
import { GuestGuard } from "../shared/components/guards/GuestGuard";
import { RoleGuard } from "../shared/components/guards/RoleGuard";
import { MainLayout } from "../shared/components/layout/MainLayout";

import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { VerifyEmailPage } from "../pages/VerifyEmailPage";

import { HomePage } from "../pages/HomePage";
import { ProfilePage } from "../pages/ProfilePage";
import { FollowListPage } from "../pages/FollowListPage";
import { PostDetailPage } from "../pages/PostDetailPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { SearchPage } from "../pages/SearchPage";
import { BookmarksPage } from "../pages/BookmarksPage";
import { MessagesPage } from "../pages/MessagesPage";
import { ChatPage } from "../pages/ChatPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ForbiddenPage } from "../pages/ForbiddenPage";

import { SettingsLayout } from "../pages/settings/SettingsLayout";
import { SettingsIndexRedirect } from "../pages/settings/SettingsIndexRedirect";
import { AccountSettingsPage } from "../pages/settings/AccountSettingsPage";
import { PrivacySettingsPage } from "../pages/settings/PrivacySettingsPage";
import { ThemeSettingsPage } from "../pages/settings/ThemeSettingsPage";
import { SecuritySettingsPage } from "../pages/settings/SecuritySettingsPage";

import { AdminUsersPage } from "../pages/admin/AdminUsersPage";

// Khai báo route dạng config (RouteObject[]) để dùng với useRoutes,
// thay vì JSX <Routes><Route/></Routes> lồng nhau như trước — dễ đọc, dễ thêm
// điều kiện phân quyền theo từng nhánh, và có thể tách nhỏ / merge nhiều route config sau này.
const routes: RouteObject[] = [
  // ── Guest only (đã đăng nhập thì đá về "/") ──
  {
    path: "/login",
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestGuard>
        <RegisterPage />
      </GuestGuard>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <GuestGuard>
        <ForgotPasswordPage />
      </GuestGuard>
    ),
  },

  // ── Cần đăng nhập nhưng không nằm trong MainLayout (không có navbar/sidebar) ──
  {
    path: "/verify-email",
    element: (
      <AuthGuard>
        <VerifyEmailPage />
      </AuthGuard>
    ),
  },

  // ── Các route cần đăng nhập + dùng chung MainLayout ──
  {
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/profile/:username", element: <ProfilePage /> },
      {
        path: "/profile/:username/followers/:userId",
        element: <FollowListPage mode="followers" />,
      },
      {
        path: "/profile/:username/following/:userId",
        element: <FollowListPage mode="following" />,
      },
      { path: "/post/:postId", element: <PostDetailPage /> },
      { path: "/notifications", element: <NotificationsPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/bookmarks", element: <BookmarksPage /> },

      {
        path: "/messages",
        element: <MessagesPage />,
        children: [{ path: ":conversationId", element: <ChatPage /> }],
      },

      {
        path: "/settings",
        element: <SettingsLayout />,
        children: [
          { index: true, element: <SettingsIndexRedirect /> },
          { path: "account", element: <AccountSettingsPage /> },
          { path: "privacy", element: <PrivacySettingsPage /> },
          { path: "theme", element: <ThemeSettingsPage /> },
          { path: "security", element: <SecuritySettingsPage /> },
        ],
      },

      // ── Route chỉ dành cho ROLE_ADMIN — RoleGuard lồng trong AuthGuard/MainLayout ──
      {
        path: "/admin/users",
        element: (
          <RoleGuard allowedRoles={["ROLE_ADMIN"]}>
            <AdminUsersPage />
          </RoleGuard>
        ),
      },
    ],
  },

  // ── Lỗi quyền truy cập / không tìm thấy trang ──
  { path: "/403", element: <ForbiddenPage /> },
  { path: "*", element: <NotFoundPage /> },
];

const AppRoutes = () => useRoutes(routes);

export const AppRouter = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);
