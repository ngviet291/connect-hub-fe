import type { ReactNode } from "react";
import {
  HeartIcon,
  ReplyIcon,
  UserIcon,
  RepostIcon,
} from "../../../shared/components/icons/Icons";
import type { NotificationType } from "../types/notification.types";

export const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const map: Record<NotificationType, { icon: ReactNode; bg: string }> = {
    FOLLOW: {
      icon: <UserIcon filled size={16} />,
      bg: "bg-primary/15 text-primary",
    },
    REACTION: {
      icon: <HeartIcon filled size={16} />,
      bg: "bg-rose-500/15 text-rose-500",
    },
    LIKE: {
      icon: <HeartIcon filled size={16} />,
      bg: "bg-rose-500/15 text-rose-500",
    },
    COMMENT: {
      icon: <ReplyIcon size={16} />,
      bg: "bg-sky-500/15 text-sky-500",
    },
    MESSAGE: {
      icon: <ReplyIcon size={16} />,
      bg: "bg-indigo-500/15 text-indigo-500",
    },
    MESSAGE_PENDING: {
      icon: <ReplyIcon size={16} />,
      bg: "bg-amber-500/15 text-amber-500",
    },
    MENTION: {
      icon: <ReplyIcon size={16} />,
      bg: "bg-yellow-500/15 text-yellow-500",
    },
    REPOST: {
      icon: <RepostIcon size={16} />,
      bg: "bg-emerald-500/15 text-emerald-500",
    },
    SYSTEM: {
      icon: <UserIcon size={16} />,
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
