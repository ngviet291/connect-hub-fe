import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useTranslation } from "react-i18next";
import type { ChatMessage } from "../types/message.types";
import type { PostAuthor } from "../../post/types/post.types";
import {
  ReplyIcon,
  MoreHorizontalIcon,
} from "../../../shared/components/icons/Icons";
import { Dropdown } from "../../../shared/components/ui/Dropdown";
import { ConfirmModal } from "../../../shared/components/ui/ConfirmModal";
import { Avatar } from "../../../shared/components/ui/Avatar";

export const MessageBubble = ({
  message,
  participant,
  onReply,
  onRecall,
}: {
  message: ChatMessage;
  participant: PostAuthor;
  onReply: (message: ChatMessage) => void;
  onRecall: (messageId: string) => void;
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [confirmRecall, setConfirmRecall] = useState(false);
  const isMine = message.senderId === user?.id;
  const hasMedia = !!message.media?.length;
  const goToProfile = () => navigate(`/profile/${participant.username}`);

  if (message.recalled) {
    return (
      <div
        className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"} animate-fade-in`}>
        {!isMine && (
          <Avatar
            src={participant.avatarUrl}
            name={participant.fullName}
            size="xs"
            onClick={goToProfile}
          />
        )}
        <p className="max-w-[75%] rounded-2xl border border-border px-4 py-2.5 text-sm italic text-secondary">
          {t("message_recalled")}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"} animate-fade-in`}>
      {!isMine && (
        <Avatar
          src={participant.avatarUrl}
          name={participant.fullName}
          size="xs"
          onClick={goToProfile}
        />
      )}
      <div
        className={`flex max-w-[75%] items-center gap-1.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`overflow-hidden rounded-2xl ${
            isMine
              ? "rounded-br-md bg-primary text-white"
              : "rounded-bl-md border border-border bg-surface-hover text-text"
          } ${hasMedia ? "p-1.5" : "px-4 py-2.5"}`}>
          {hasMedia && (
            <div
              className={`grid gap-1 ${message.media!.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {message.media!.map((m) =>
                m.type === "VIDEO" ? (
                  <video
                    key={m.mediaId}
                    src={m.url}
                    controls
                    className="max-h-64 w-full rounded-xl object-cover"
                  />
                ) : (
                  <img
                    key={m.mediaId}
                    src={m.url}
                    alt=""
                    className="max-h-64 w-full rounded-xl object-cover"
                  />
                ),
              )}
            </div>
          )}
          {message.content && (
            <p
              className={`text-[15px] leading-relaxed ${hasMedia ? "px-2 pb-1 pt-2" : ""}`}>
              {message.content}
            </p>
          )}
        </div>

        {/* Hover toolbar: reply / recall. Reaction đã bỏ — BE chưa có endpoint lưu reaction,
            tránh hiển thị 1 action tưởng như hoạt động nhưng không lưu được dữ liệu thật. */}
        <div className="relative flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onReply(message)}
            title={t("reply_action")}
            className="cursor-pointer rounded-full p-1.5 text-secondary hover:bg-surface-hover hover:text-text">
            <ReplyIcon size={16} />
          </button>
          {isMine && (
            <Dropdown
              align={isMine ? "right" : "left"}
              trigger={
                <button
                  title={t("recall_action")}
                  className="cursor-pointer rounded-full p-1.5 text-secondary hover:bg-surface-hover hover:text-text">
                  <MoreHorizontalIcon size={16} />
                </button>
              }
              items={[
                {
                  label: t("recall_action"),
                  danger: true,
                  onClick: () => setConfirmRecall(true),
                },
              ]}
            />
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmRecall}
        onClose={() => setConfirmRecall(false)}
        onConfirm={() => onRecall(message.id)}
        title={t("recall_confirm_title")}
        description={t("recall_confirm_desc")}
        confirmLabel={t("recall_action")}
        cancelLabel={t("cancel")}
        danger
      />
    </div>
  );
};
