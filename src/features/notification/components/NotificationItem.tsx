import { useNavigate } from "react-router-dom";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { useTimeAgo } from "../../../shared/utils/date";
import type { NotificationResponse } from "../types/notification.types";
import { NotificationIcon } from "./NotificationIcon";

interface NotificationItemProps {
  notification: NotificationResponse;
  onRead?: (id: string) => void;
}

export const NotificationItem = ({
  notification,
  onRead,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const timeAgo = useTimeAgo();

  const handleClick = () => {
    // Chỉ gọi mark-as-read khi noti thực sự đang unread, tránh gọi API thừa
    // mỗi lần bấm vào 1 noti đã đọc rồi.
    if (!notification.read) {
      onRead?.(notification.id);
    }

    // Ưu tiên targetUrl do BE trả (đúng & tổng quát cho mọi NotificationType).
    // Nếu BE chưa trả targetUrl cho loại noti này (null), fallback theo post/user.
    if (notification.targetUrl) {
      navigate(notification.targetUrl);
    } else if (notification.post?.id) {
      navigate(`/post/${notification.post.id}`);
    } else {
      navigate(`/profile/${notification.user.username}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface/60 ${
        !notification.read ? "bg-primary/[0.05]" : ""
      }`}>
      <NotificationIcon type={notification.type} />

      <Avatar
        src={notification.user.avatarUrl}
        name={notification.user.username}
        size="sm"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm text-text">
          <span className="font-semibold">{notification.user.username}</span>{" "}
          {notification.content}
        </p>

        <p className="mt-0.5 text-xs text-secondary">
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      {!notification.read && (
        <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
      )}
    </button>
  );
};
