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
    LIKE: {
      icon: <HeartIcon filled size={16} />,
      bg: "bg-rose-500/15 text-rose-500",
    },
    REPLY: { icon: <ReplyIcon size={16} />, bg: "bg-sky-500/15 text-sky-500" },
    FOLLOW: {
      icon: <UserIcon filled size={16} />,
      bg: "bg-primary/15 text-primary",
    },
    REPOST: {
      icon: <RepostIcon size={16} />,
      bg: "bg-emerald-500/15 text-emerald-500",
    },
    MENTION: {
      icon: <ReplyIcon size={16} />,
      bg: "bg-amber-500/15 text-amber-500",
    },
  };
  const { icon, bg } = map[type];
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}
    >
      {icon}
    </div>
  );
};
