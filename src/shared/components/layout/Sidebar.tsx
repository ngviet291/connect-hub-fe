import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { authService } from "../../../features/auth/service/authService";
import { useTheme } from "../../../features/theme/useTheme";
import { useTranslation } from "react-i18next";
import { Avatar } from "../ui/Avatar";
import { Dropdown } from "../ui/Dropdown";
import {
  HomeIcon,
  SearchIcon,
  PlusSquareIcon,
  BellIcon,
  MailIcon,
  UserIcon,
  BookmarkIcon,
  SettingsIcon,
  MoreIcon,
  SunIcon,
  MoonIcon,
  LogoIcon,
} from "../icons/Icons";
import { CreatePostModal } from "../../../features/post/components/CreatePostModal";
import { useNotifications } from "../../../features/notification/hooks/useNotifications";
import { useConversations } from "../../../features/message/hooks/useConversations";
import { useConversationsRealtime } from "../../../features/message/hooks/useConversationsRealtime";
import { SuggestedUsers } from "../../../features/user/components/SuggestedUsers";
import { TrendingWidget } from "./TrendingWidget";

const navItem =
  "flex items-center gap-3.5 rounded-full px-4 py-3 text-[15px] font-medium transition-colors cursor-pointer";

export const LeftSidebar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [composeOpen, setComposeOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { totalUnread } = useConversations();
  // LeftSidebar luôn được mount (kể cả trên mobile — chỉ ẩn bằng CSS "hidden",
  // không unmount) nên đây là nơi DUY NHẤT giữ 1 subscription WS thật cho
  // "/user/queue/messages" + "/user/queue/pending" (xem messageRealtimeBus.ts).
  // Không gọi hook này ở nơi khác (ConversationList, ChatPage...) để tránh
  // tăng unreadCount / bắn toast pending 2 lần cho cùng 1 sự kiện.
  useConversationsRealtime();

  if (!user) return null;

  return (
    <aside className="hidden h-full w-[76px] shrink-0 flex-col justify-between overflow-y-auto border-border py-4 md:flex md:bg-surface lg:w-64 lg:px-2 md:rounded-2xl md:border">
      <div className="flex flex-col gap-1">
        <Link
          to="/"
          className="mb-4 flex cursor-pointer items-center gap-2 px-4">
          <LogoIcon size={30} />
          <span className="hidden text-lg font-bold text-text lg:inline">
            ConnectHub
          </span>
        </Link>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${navItem} justify-center lg:justify-start ${isActive ? "text-text" : "text-secondary hover:bg-surface-hover hover:text-text"}`
          }>
          <HomeIcon filled size={25} />
          <span className="hidden lg:inline">{t("nav_home")}</span>
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `${navItem} justify-center lg:justify-start ${isActive ? "text-text" : "text-secondary hover:bg-surface-hover hover:text-text"}`
          }>
          <SearchIcon size={25} />
          <span className="hidden lg:inline">{t("nav_search")}</span>
        </NavLink>
        <button
          onClick={() => setComposeOpen(true)}
          className={`${navItem} justify-center text-secondary hover:bg-surface-hover hover:text-text lg:justify-start`}>
          <PlusSquareIcon size={25} />
          <span className="hidden lg:inline">{t("nav_create")}</span>
        </button>
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `relative ${navItem} justify-center lg:justify-start ${isActive ? "text-text" : "text-secondary hover:bg-surface-hover hover:text-text"}`
          }>
          <span className="relative">
            <BellIcon size={25} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent" />
            )}
          </span>
          <span className="hidden lg:inline">{t("nav_activity")}</span>
        </NavLink>
        <NavLink
          to="/messages"
          className={({ isActive }) =>
            `relative ${navItem} justify-center lg:justify-start ${isActive ? "text-text" : "text-secondary hover:bg-surface-hover hover:text-text"}`
          }>
          <span className="relative">
            <MailIcon size={25} />
            {totalUnread > 0 && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent" />
            )}
          </span>
          <span className="hidden lg:inline">{t("nav_messages")}</span>
        </NavLink>
        <NavLink
          to={`/profile/${user.username}`}
          className={({ isActive }) =>
            `${navItem} justify-center lg:justify-start ${isActive ? "text-text" : "text-secondary hover:bg-surface-hover hover:text-text"}`
          }>
          <UserIcon size={25} />
          <span className="hidden lg:inline">{t("nav_profile")}</span>
        </NavLink>
        <NavLink
          to="/bookmarks"
          className={({ isActive }) =>
            `${navItem} justify-center lg:justify-start ${isActive ? "text-text" : "text-secondary hover:bg-surface-hover hover:text-text"}`
          }>
          <BookmarkIcon size={23} />
          <span className="hidden lg:inline">{t("nav_bookmarks")}</span>
        </NavLink>
      </div>

      <div className="flex flex-col gap-1 px-0 lg:px-2">
        <Dropdown
          align="left"
          direction="up"
          menuClassName="rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
          trigger={
            <div
              className={`${navItem} justify-center text-secondary hover:bg-surface-hover hover:text-text lg:justify-start`}>
              <MoreIcon size={25} />
              <span className="hidden lg:inline">{t("nav_more")}</span>
            </div>
          }
          items={[
            {
              label: theme === "dark" ? t("theme_light") : t("theme_dark"),
              icon:
                theme === "dark" ? (
                  <SunIcon size={18} />
                ) : (
                  <MoonIcon size={18} />
                ),
              onClick: toggleTheme,
            },
            {
              label: t("nav_settings"),
              icon: <SettingsIcon size={18} />,
              onClick: () => navigate("/settings"),
            },
            {
              label: t("nav_logout"),
              danger: true,
              onClick: () => authService.logout(),
            },
          ]}
        />
        <button
          onClick={() => navigate(`/profile/${user.username}`)}
          className="mt-1 flex cursor-pointer items-center gap-3 rounded-full px-2 py-2 hover:bg-surface-hover lg:px-3">
          <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
          <span className="hidden truncate text-sm font-medium text-text lg:inline">
            {user.fullName}
          </span>
        </button>
      </div>

      <CreatePostModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={() => navigate("/")}
      />
    </aside>
  );
};

export const RightSidebar = () => {
  return (
    <aside className="hidden h-full w-80 shrink-0 flex-col gap-4 overflow-y-auto py-2 xl:flex">
      <TrendingWidget />
      <SuggestedUsers />
    </aside>
  );
};
