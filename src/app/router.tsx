import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../shared/components/guards/AuthGuard';
import { GuestGuard } from '../shared/components/guards/GuestGuard';
import { MainLayout } from '../shared/components/layout/MainLayout';

import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { VerifyEmailPage } from '../pages/VerifyEmailPage';

import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { FollowListPage } from '../pages/FollowListPage';
import { PostDetailPage } from '../pages/PostDetailPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SearchPage } from '../pages/SearchPage';
import { BookmarksPage } from '../pages/BookmarksPage';
import { MessagesPage } from '../pages/MessagesPage';
import { ChatPage } from '../pages/ChatPage';
import { NotFoundPage } from '../pages/NotFoundPage';

import { SettingsLayout } from '../pages/settings/SettingsLayout';
import { SettingsIndexRedirect } from '../pages/settings/SettingsIndexRedirect';
import { AccountSettingsPage } from '../pages/settings/AccountSettingsPage';
import { PrivacySettingsPage } from '../pages/settings/PrivacySettingsPage';
import { ThemeSettingsPage } from '../pages/settings/ThemeSettingsPage';
import { SecuritySettingsPage } from '../pages/settings/SecuritySettingsPage';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
      <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
      <Route path="/forgot-password" element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />
      <Route path="/verify-email" element={<AuthGuard><VerifyEmailPage /></AuthGuard>} />

      <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/profile/:username/followers" element={<FollowListPage mode="followers" />} />
        <Route path="/profile/:username/following" element={<FollowListPage mode="following" />} />
        <Route path="/post/:postId" element={<PostDetailPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />

        <Route path="/messages" element={<MessagesPage />}>
          <Route path=":conversationId" element={<ChatPage />} />
        </Route>

        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<SettingsIndexRedirect />} />
          <Route path="account" element={<AccountSettingsPage />} />
          <Route path="privacy" element={<PrivacySettingsPage />} />
          <Route path="theme" element={<ThemeSettingsPage />} />
          <Route path="security" element={<SecuritySettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);
