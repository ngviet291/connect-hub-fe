import type { ReactNode } from "react";

import type { NotificationType } from "../types/notification.types";
import { FaAt, FaBell, FaCommentDots, FaHeart, FaUserPlus } from "react-icons/fa";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaRepeat, FaUserGroup } from "react-icons/fa6";

export const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const map: Record<NotificationType, { icon: ReactNode; bg: string }> = {
    FOLLOW: {
      icon: <FaUserPlus size={16} />,
      bg: "bg-primary/15 text-primary",
    },
    REACTION: {
      icon: <FaHeart size={16} />,
      bg: "bg-rose-500/15 text-rose-500",
    },
    LIKE: {
      icon: <FaHeart size={16} />,
      bg: "bg-rose-500/15 text-rose-500",
    },
    COMMENT: {
      icon: <FaCommentDots size={16} />,
      bg: "bg-sky-500/15 text-sky-500",
    },
    MESSAGE: {
      icon: <IoChatbubbleEllipses size={16} />,
      bg: "bg-indigo-500/15 text-indigo-500",
    },
    MESSAGE_PENDING: {
      icon: <IoChatbubbleEllipses size={16} />,
      bg: "bg-amber-500/15 text-amber-500",
    },
    MENTION: {
      icon: <FaAt size={16} />,
      bg: "bg-yellow-500/15 text-yellow-500",
    },
    REPOST: {
      icon: <FaRepeat size={16} />,
      bg: "bg-emerald-500/15 text-emerald-500",
    },
    // Trước đây THIẾU case này dù "CREATED_GROUP" đã có trong NotificationType
    // (dùng ở useNotificationsRealtime.ts) -> map[type] trả undefined -> dòng
    // "const { icon, bg } = map[type]" bên dưới throw "Cannot destructure
    // property 'icon' of undefined" mỗi khi có noti loại này render ra danh
    // sách (crash cả NotificationDropdown lẫn NotificationsPage).
    CREATED_GROUP: {
      icon: <FaUserGroup size={16} />,
      bg: "bg-violet-500/15 text-violet-500",
    },
    SYSTEM: {
      icon: <FaBell size={16} />,
      bg: "bg-slate-500/15 text-slate-500",
    },
  };
  const { icon, bg } = map[type];
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
      {icon}
    </div>
  );
};
