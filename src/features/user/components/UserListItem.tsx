import { useNavigate } from "react-router-dom";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { Button } from "../../../shared/components/ui/Button";
import { useTranslation } from "react-i18next";
import type { UserListEntry } from "../types/user.types";

interface UserListItemProps {
  user: UserListEntry;
  onToggleFollow?: (user: UserListEntry) => void;
  hideFollowButton?: boolean;
  disabled?: boolean;
}

export const UserListItem = ({
  user,
  onToggleFollow,
  hideFollowButton,
  disabled,
}: UserListItemProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface/50">
      <Avatar
        src={user.avatarUrl}
        name={user.fullName}
        size="lg"
        onClick={() => navigate(`/profile/${user.username}`)}
      />
      <div
        className="min-w-0 flex-1 cursor-pointer"
        onClick={() => navigate(`/profile/${user.username}`)}>
        <p className="truncate font-semibold text-text">{user.fullName}</p>
        <p className="truncate text-sm text-secondary">@{user.username}</p>
        {user.bio && (
          <p className="mt-0.5 truncate text-sm text-secondary">{user.bio}</p>
        )}
      </div>
      {!hideFollowButton && (
        <Button
          size="sm"
          variant={user.isFollowing ? "outline" : "primary"}
          onClick={() => onToggleFollow?.(user)}
          disabled={disabled}
          className="shrink-0">
          {user.isFollowing ? t("following") : t("follow")}
        </Button>
      )}
    </div>
  );
};
