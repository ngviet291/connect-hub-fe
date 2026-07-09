import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { Button } from "../../../shared/components/ui/Button";
import { Modal } from "../../../shared/components/ui/Modal";
import { Textarea } from "../../../shared/components/ui/Textarea";
import {
  ImageIcon,
  VideoIcon,
  XIcon,
} from "../../../shared/components/icons/Icons";
import { useAuth } from "../../auth/store/AuthContext";
import { POST_MAX_LENGTH } from "../../../constants/limits";
import { mediaService } from "../../media/mediaService";
import type { Post, PostMedia } from "../types/post.types";
import { postApi } from "../api/postApi";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (post: Post) => void;
}

export const CreatePostModal = ({
  isOpen,
  onClose,
  onCreated,
}: CreatePostModalProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const reset = () => {
    media.forEach((m) => mediaService.revoke(m.url));
    setContent("");
    setMedia([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const uploaded = await Promise.all(
      Array.from(files)
        .slice(0, 4 - media.length)
        .map((f) => mediaService.uploadFile(f)),
    );
    setMedia((prev) => [...prev, ...uploaded]);
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) mediaService.revoke(target.url);
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) return;
    setIsSubmitting(true);
    try {
      const post = await postApi.createPost({ content, media });
      onCreated(post);
      reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("nav_create")}>
      <div className="p-4">
        <div className="flex gap-3">
          <Avatar src={user.avatarUrl} name={user.fullName} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text">{user.username}</p>
            <Textarea
              autoFocus
              value={content}
              onChange={(e) =>
                setContent(e.target.value.slice(0, POST_MAX_LENGTH))
              }
              placeholder={t("composer_placeholder")}
              rows={4}
              className="mt-1"
            />
            {media.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {media.map((m) => (
                  <div
                    key={m.id}
                    className="group relative overflow-hidden rounded-xl border border-border"
                  >
                    {m.type === "VIDEO" ? (
                      <video src={m.url} className="h-32 w-full object-cover" />
                    ) : (
                      <img
                        src={m.url}
                        alt=""
                        className="h-32 w-full object-cover"
                      />
                    )}
                    <button
                      onClick={() => removeMedia(m.id)}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={media.length >= 4}
                className="flex cursor-pointer items-center justify-center rounded-full p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ImageIcon size={20} />
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={media.length >= 4}
                className="flex cursor-pointer items-center justify-center rounded-full p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <VideoIcon size={20} />
              </button>
              <span
                className={`ml-auto text-xs ${content.length > POST_MAX_LENGTH - 30 ? "text-amber-500" : "text-secondary"}`}
              >
                {content.length}/{POST_MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-secondary">
            {t("anyone_can_reply")}
          </span>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!content.trim() && media.length === 0}
          >
            {t("post_button")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
