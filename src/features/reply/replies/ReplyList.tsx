import { ReplyItem } from "./ReplyItem";
import { EmptyState } from "../../../shared/components/ui/EmptyState";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { useTranslation } from "react-i18next";
import type { ReplyItem as ReplyItemType } from "../types/reply.types";

interface ReplyListProps {
  replies: ReplyItemType[];
  isLoading: boolean;
  onLike?: (id: string) => void;
}

export const ReplyList = ({ replies, isLoading, onLike }: ReplyListProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-3 border-b border-border px-4 py-3.5"
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (replies.length === 0)
    return (
      <EmptyState
        title={t("reply_empty_title")}
        description={t("reply_empty_desc")}
      />
    );

  return (
    <div>
      {replies.map((c) => (
        <ReplyItem key={c.id} reply={c} onLike={onLike} />
      ))}
    </div>
  );
};
