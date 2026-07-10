import { useState } from "react";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { Button } from "../../../shared/components/ui/Button";
import { useAuth } from "../../auth/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { REPLY_MAX_LENGTH } from "../../../constants/limits";

export const ReplyForm = ({
  onSubmit,
}: {
  onSubmit: (content: string) => Promise<unknown>;
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
      <input
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, REPLY_MAX_LENGTH))}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder={t("reply_placeholder")}
        className="flex-1 bg-transparent text-[15px] text-text placeholder-secondary outline-none"
      />
      <Button
        size="sm"
        onClick={handleSubmit}
        loading={isSubmitting}
        disabled={!content.trim()}
      >
        {t("send")}
      </Button>
    </div>
  );
};
