import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellIcon } from "../../../shared/components/icons/Icons";
import { Badge } from "../../../shared/components/ui/Badge";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import { useTranslation } from "react-i18next";
import { NotificationItem } from "./NotificationItem";
import { NotificationItemSkeleton } from "../../../shared/components/ui/Skeleton";
import {
  useGetNotificationsQuery,
  useCountUnreadQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../api/notificationApi";
import { useNotificationsRealtime } from "../hooks/useNotificationsRealtime";

export const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Dù bao nhiêu component cùng gọi các hook này, RTK Query chỉ bắn 1 request
  // thật sự cho mỗi query key — các lần gọi thêm chỉ đọc lại từ cache.
  const { data, isLoading } = useGetNotificationsQuery();
  const { data: unreadCount = 0 } = useCountUnreadQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  useNotificationsRealtime();

  const notifications = data?.content ?? [];

  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <IconButton
          icon={<BellIcon size={24} filled={open} />}
          onClick={() => setOpen((o) => !o)}
        />
        {unreadCount > 0 && (
          <Badge className="absolute -right-0.5 -top-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </div>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 max-h-[28rem] w-80 animate-scale-in overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-semibold text-text">
              {t("notifications_title")}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="cursor-pointer text-xs font-medium text-primary hover:underline">
                {t("mark_all_read")}
              </button>
            )}
          </div>
          {isLoading &&
            // Skeleton cùng kích thước với NotificationItem thật, thay vì 1 spinner nhỏ
            // giữa khoảng trống lớn -> tránh hụt/giật layout (gap) khi data load xong.
            Array.from({ length: 4 }).map((_, i) => (
              <NotificationItemSkeleton key={i} />
            ))}
          {!isLoading && notifications.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-secondary">
              {t("empty_notifications")}
            </p>
          )}
          {notifications.slice(0, 6).map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={(id) => markAsRead(id)}
            />
          ))}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
            className="w-full cursor-pointer border-t border-border py-3 text-center text-sm font-medium text-primary hover:bg-surface-hover">
            {t("view_all")}
          </button>
        </div>
      )}
    </div>
  );
};
