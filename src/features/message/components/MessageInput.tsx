import { useEffect, useRef, useState } from "react";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useTranslation } from "react-i18next";
import {
  SendIcon,
  ImageIcon,
  XIcon,
} from "../../../shared/components/icons/Icons";
import {
  createAttachment,
  revokeAttachment,
  type PendingAttachment,
} from "../utils/attachment";
import type { ChatMessage } from "../types/message.types";

const MAX_ATTACHMENTS = 4;

export const MessageInput = ({
  onSend,
  disabled,
  replyingTo,
  onCancelReply,
}: {
  /** media ở đây là PendingAttachment (local blob preview) — nơi gọi onSend
   *  chịu trách nhiệm upload thật rồi map sang MediaRequest trước khi gọi
   *  messageService.sendMessage (xem TODO trong utils/attachment.ts).
   *  Trả về `true` nếu gửi thành công — MessageInput chỉ xoá nội dung đang
   *  gõ khi biết chắc đã gửi thành công, tránh mất tin nhắn khi gửi lỗi. */
  onSend: (
    text: string,
    media?: PendingAttachment[],
    onUploadProgress?: (percent: number) => void,
  ) => Promise<boolean>;
  disabled?: boolean;
  replyingTo?: ChatMessage | null;
  onCancelReply?: () => void;
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [media, setMedia] = useState<PendingAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // % tổng dung lượng đã upload của batch media hiện tại (0-100, null = không
  // đang upload) — quan trọng nhất với video vì dung lượng lớn, thời gian chờ
  // lâu hơn hẳn ảnh, cần phản hồi rõ hơn 1 spinner chung chung.
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const hasVideo = media.some((m) => m.type === "VIDEO");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref luôn trỏ media mới nhất để cleanup lúc unmount không bị "đóng băng"
  // theo closure của lần render đầu (effect cleanup chỉ tạo 1 lần).
  const mediaRef = useRef(media);
  mediaRef.current = media;

  // Revoke hết blob: URL còn treo khi rời màn hình chat lúc đang chọn dở file
  // chưa gửi — tránh rò rỉ bộ nhớ (URL.createObjectURL không tự giải phóng).
  useEffect(() => {
    return () => {
      mediaRef.current.forEach((m) => revokeAttachment(m.url));
    };
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    const picked = Array.from(files)
      .slice(0, MAX_ATTACHMENTS - media.length)
      .map(createAttachment);
    setMedia((prev) => [...prev, ...picked]);
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) revokeAttachment(target.url);
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleSend = async () => {
    if (disabled || isSubmitting) return; // chặn double-send (vd. bấm Enter dồn dập lúc đang gửi)
    if (!value.trim() && media.length === 0) return;
    const textToSend = value.trim();
    const mediaToSend = media.length ? media : undefined;
    setIsSubmitting(true);
    setUploadProgress(mediaToSend ? 0 : null);
    try {
      const ok = await onSend(
        textToSend,
        mediaToSend,
        mediaToSend ? setUploadProgress : undefined,
      );
      // Chỉ xoá nội dung đang gõ khi gửi THÀNH CÔNG — gửi lỗi (mất mạng, upload
      // fail...) thì giữ nguyên để người dùng không mất công gõ lại từ đầu.
      if (ok) {
        setValue("");
        setMedia([]);
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="border-t border-border p-3">
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-surface-hover px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary">
              {t("reply_to_label")}
            </p>
            <p className="truncate text-xs text-secondary">
              {replyingTo.recalled
                ? t("message_recalled")
                : replyingTo.content || t("message_media_label")}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="shrink-0 cursor-pointer text-secondary hover:text-text">
            <XIcon size={16} />
          </button>
        </div>
      )}
      {media.length > 0 && (
        <div className="mb-2 flex flex-col gap-1.5">
          <div className="flex gap-2 overflow-x-auto">
            {media.map((m) => (
              <div
                key={m.id}
                className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
                {m.type === "VIDEO" ? (
                  <video src={m.url} className="h-full w-full object-cover" />
                ) : (
                  <img
                    src={m.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
                {/* BUG ĐÃ SỬA: trước đây gửi ảnh/video không có bất kỳ dấu hiệu
                    loading nào — người dùng bấm gửi rồi im re không biết đang
                    upload hay đã gửi thất bại, video lại càng lâu càng khó chịu
                    vì không biết còn bao lâu. Giờ hiện % tiến trình thật (từ
                    axios onUploadProgress) đè lên thumbnail lúc đang gửi. */}
                {isSubmitting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    {uploadProgress !== null ? (
                      <span className="text-xs font-semibold text-white">
                        {uploadProgress}%
                      </span>
                    ) : (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    )}
                  </div>
                )}
                <button
                  onClick={() => removeMedia(m.id)}
                  disabled={isSubmitting}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white disabled:cursor-not-allowed disabled:opacity-0">
                  <XIcon size={12} />
                </button>
              </div>
            ))}
          </div>
          {/* Thanh progress tổng — % của CẢ BATCH file trong 1 request multipart
              duy nhất (không tách được theo từng file), quan trọng nhất với
              video vì dung lượng lớn hơn hẳn ảnh nên mất nhiều thời gian hơn. */}
          {isSubmitting && uploadProgress !== null && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="shrink-0 text-xs text-secondary">
                {hasVideo
                  ? t("uploading_video_progress", { percent: uploadProgress })
                  : `${uploadProgress}%`}
              </span>
            </div>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <IconButton
          icon={<ImageIcon size={20} />}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSubmitting || media.length >= MAX_ATTACHMENTS}
          className="text-secondary hover:bg-surface-hover hover:text-primary"
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            // Trước đây gọi handleSend() vô điều kiện — bấm Enter trong lúc
            // đang gửi (isSending) hoặc lúc input bị disabled vẫn lọt qua,
            // bỏ qua luôn nút Send đã bị khoá. Phải check y hệt điều kiện
            // của nút Send bên dưới.
            if (e.key === "Enter" && !disabled && !isSubmitting) handleSend();
          }}
          disabled={disabled}
          placeholder={t("message_placeholder")}
          className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-[15px] text-text placeholder-secondary outline-none focus:border-primary disabled:opacity-60"
        />
        <IconButton
          icon={
            isSubmitting ? (
              <div className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <SendIcon size={20} />
            )
          }
          onClick={handleSend}
          disabled={
            disabled || isSubmitting || (!value.trim() && media.length === 0)
          }
          className="bg-primary text-white hover:bg-primary-hover"
        />
      </div>
    </div>
  );
};
