import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { Spinner } from "../../../shared/components/ui/Spinner";
import { followService } from "../../follow/service/followService";
import type { UserSummaryResponse } from "../../follow/types/follow.types";
import { useAuth } from "../../auth/hooks/useAuth";

/**
 * Danh sách chọn thành viên — nguồn ứng viên lấy từ "đang follow" (
 * followService.getFollowing) của chính user hiện tại, vì đây là những
 * người hợp lý nhất để thêm vào 1 nhóm chat. `excludeIds` dùng để loại
 * những người ĐÃ là thành viên (khi thêm người vào group đã tồn tại).
 */
export const MemberPicker = ({
  selectedIds,
  onChange,
  excludeIds = [],
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  excludeIds?: string[];
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<UserSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.username) return;
    let cancelled = false;
    setIsLoading(true);
    followService
      .getFollowing(user.username)
      .then((res) => {
        if (!cancelled) setCandidates(res.content);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.username]);

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  const visible = candidates.filter((c) => !excludeIds.includes(c.id));

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size={6} />
      </div>
    );
  }

  if (error) {
    return <p className="py-4 text-center text-sm text-danger">{error}</p>;
  }

  if (visible.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-secondary">
        {t("member_picker_empty")}
      </p>
    );
  }

  return (
    <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
      {visible.map((c) => {
        const checked = selectedIds.includes(c.id);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => toggle(c.id)}
            className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-hover ${checked ? "bg-surface-hover" : ""}`}
          >
            <Avatar src={c.avatarUrl} name={c.fullName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">{c.fullName}</p>
              <p className="truncate text-xs text-secondary">@{c.username}</p>
            </div>
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                checked ? "border-primary bg-primary" : "border-border"
              }`}
            >
              {checked && (
                <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-white">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
