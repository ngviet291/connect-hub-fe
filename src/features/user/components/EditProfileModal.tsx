import { useState, type FormEvent, type ChangeEvent } from "react";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Textarea } from "../../../shared/components/ui/Textarea";
import { Modal } from "../../../shared/components/ui/Modal";
import { useToast } from "../../../shared/components/ui/Toast";
import { useTranslation } from "react-i18next";
import { BIO_MAX_LENGTH } from "../../../constants/limits";
import type { UpdateProfileRequest, UserProfile } from "../types/user.types";
import { userService } from "../service/userService";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
  profile,
  onSaved,
}: EditProfileModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [form, setForm] = useState<UpdateProfileRequest>({
    fullName: profile.fullName,
    bio: profile.bio ?? "",
    website: profile.website ?? "",
    location: profile.location ?? "",
    phoneNumber: profile.phoneNumber ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set =
    (key: keyof UpdateProfileRequest) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let updated: UserProfile = profile;
      if (avatarFile) {
        updated = await userService.uploadAvatar(avatarFile);
      }
      if (
        form.fullName !== profile.fullName ||
        form.bio !== profile.bio ||
        form.website !== profile.website ||
        form.location !== profile.location ||
        form.phoneNumber !== profile.phoneNumber
      ) {
        updated = await userService.updateProfile(form);
      }
      setSaved(true);
      onSaved(updated);
      setAvatarFile(null);
      window.setTimeout(() => {
        setIsSaving(false);
        onClose();
        setSaved(false);
      }, 700);
    } catch (error) {
      setIsSaving(false);
      showToast(
        error instanceof Error
          ? error.message
          : t("error_update_profile"),
        "error",
      );
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("edit_profile_title")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatarUrl}
            name={profile.fullName}
            size="lg"
          />
          <label className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-surface-hover">
            {t("change_avatar")}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <Input
          label={t("display_name")}
          value={form.fullName}
          onChange={set("fullName")}
          maxLength={50}
          required
        />
        <Input
          label="Số điện thoại"
          value={form.phoneNumber ?? ""}
          onChange={set("phoneNumber")}
          type="tel"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-secondary">
            {t("bio")}
          </label>
          <Textarea
            value={form.bio}
            onChange={set("bio")}
            rows={3}
            maxLength={BIO_MAX_LENGTH}
            className="rounded-xl border border-border bg-surface px-4 py-2.5"
          />
          <span className="self-end text-xs text-secondary">
            {(form.bio ?? "").length}/{BIO_MAX_LENGTH}
          </span>
        </div>
        <Input
          label={t("location")}
          value={form.location}
          onChange={set("location")}
        />
        <Input
          label={t("website")}
          value={form.website}
          onChange={set("website")}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button type="submit" loading={isSaving}>
            {saved ? t("saved_confirm") : t("save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
