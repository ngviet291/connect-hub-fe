import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../../../shared/components/ui/Modal";
import { Input } from "../../../shared/components/ui/Input";
import { Button } from "../../../shared/components/ui/Button";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { ConfirmModal } from "../../../shared/components/ui/ConfirmModal";
import { Spinner } from "../../../shared/components/ui/Spinner";
import { MemberPicker } from "./MemberPicker";
import { XIcon, PlusSquareIcon, CameraIcon } from "../../../shared/components/icons/Icons";
import { conversationService } from "../service/conversationService";
import { useToast } from "../../../shared/components/ui/Toast";
import type { ConversationDetailResponse } from "../types/message.types";

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  detail: ConversationDetailResponse;
  currentUserId: string;
  /** Gọi lại sau khi rename/thêm/xoá/đổi role thành công để ChatPage refetch detail. */
  onChanged: () => void;
  /** Gọi sau khi rời nhóm thành công — ChatPage điều hướng về /messages. */
  onLeft: () => void;
}

/**
 * Trước đây conversationService.updateConversation / addMembers / removeMember /
 * updateMemberRole / leaveConversation đều đã có sẵn nhưng KHÔNG có UI nào gọi tới.
 * Modal này là màn hình quản lý group đầu tiên nối các API đó lên UI.
 */
export const GroupInfoModal = ({
  isOpen,
  onClose,
  conversationId,
  detail,
  currentUserId,
  onChanged,
  onLeft,
}: GroupInfoModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [mode, setMode] = useState<"info" | "add-members">("info");
  const [name, setName] = useState(detail.displayName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const members = detail.members.content;
  const me = members.find((m) => m.userId === currentUserId);
  const isAdmin = me?.role === "ADMIN";

  // useState(detail.displayName) chỉ nhận giá trị khởi tạo ở mount đầu tiên;
  // modal này không unmount giữa các lần mở nên cần resync thủ công mỗi khi
  // mở lại hoặc khi tên nhóm được cập nhật từ nơi khác (vd đổi qua thiết bị khác).
  useEffect(() => {
    if (isOpen) setName(detail.displayName);
  }, [isOpen, detail.displayName]);

  const handleClose = () => {
    setMode("info");
    setPickedIds([]);
    setAvatarFile(undefined);
    onClose();
  };

  const handleSaveName = async () => {
    if (!name.trim() || name.trim() === detail.displayName) return;
    setIsSavingName(true);
    try {
      await conversationService.updateConversation(conversationId, {
        name: name.trim(),
        avatar: avatarFile,
      });
      setAvatarFile(undefined);
      onChanged();
      showToast(t("group_update_success"));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t("group_update_error"), "error");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAvatarPick = async (file: File | undefined) => {
    if (!file) return;
    setAvatarFile(file);
    // Đổi avatar áp dụng ngay (không cần chờ bấm lưu tên) — trải nghiệm giống đổi avatar cá nhân.
    try {
      await conversationService.updateConversation(conversationId, { avatar: file });
      onChanged();
    } catch (e) {
      showToast(e instanceof Error ? e.message : t("group_update_error"), "error");
    }
  };

  const handleAddMembers = async () => {
    if (pickedIds.length === 0) return;
    setIsAddingMembers(true);
    try {
      await conversationService.addMembers(conversationId, { memberIds: pickedIds });
      setPickedIds([]);
      setMode("info");
      onChanged();
      showToast(t("group_add_members_success"));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t("group_add_members_error"), "error");
    } finally {
      setIsAddingMembers(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setBusyMemberId(memberId);
    try {
      await conversationService.removeMember(conversationId, memberId);
      onChanged();
    } catch (e) {
      showToast(e instanceof Error ? e.message : t("group_remove_member_error"), "error");
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleToggleRole = async (memberId: string, currentRole: "ADMIN" | "MEMBER") => {
    setBusyMemberId(memberId);
    try {
      await conversationService.updateMemberRole(conversationId, memberId, {
        role: currentRole === "ADMIN" ? "MEMBER" : "ADMIN",
      });
      onChanged();
    } catch (e) {
      showToast(e instanceof Error ? e.message : t("group_update_role_error"), "error");
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleLeave = async () => {
    try {
      await conversationService.leaveConversation(conversationId);
      handleClose();
      onLeft();
    } catch (e) {
      showToast(e instanceof Error ? e.message : t("group_leave_error"), "error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={mode === "info" ? t("group_info_title") : t("group_add_members_title")}>
      {mode === "info" ? (
        <div className="flex flex-col gap-5 p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar src={detail.displayAvatarUrl} name={detail.displayName} size="xl" />
              {isAdmin && (
                <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md">
                  <CameraIcon size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleAvatarPick(e.target.files?.[0])}
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
                  {name.trim() !== detail.displayName && (
                    <Button size="sm" onClick={handleSaveName} loading={isSavingName}>
                      {t("save")}
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-base font-semibold text-text">{detail.displayName}</p>
              )}
              <p className="mt-1 text-xs text-secondary">
                {t("group_members_count", { count: members.length })}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text">{t("group_members_label")}</p>
            {isAdmin && (
              <button
                onClick={() => setMode("add-members")}
                className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <PlusSquareIcon size={16} />
                {t("group_add_members_action")}
              </button>
            )}
          </div>

          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {members.map((m) => (
              <div key={m.userId} className="flex items-center gap-3 rounded-lg px-2 py-2">
                <Avatar src={m.avatarUrl} name={m.username} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">
                    {m.username}
                    {m.userId === currentUserId && <span className="ml-1.5 text-xs text-secondary">({t("you_label")})</span>}
                  </p>
                  <p className="text-xs text-secondary">
                    {m.role === "ADMIN" ? t("role_admin") : t("role_member")}
                  </p>
                </div>
                {isAdmin && m.userId !== currentUserId && (
                  <div className="flex shrink-0 items-center gap-1">
                    {busyMemberId === m.userId ? (
                      <Spinner size={4} />
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleRole(m.userId, m.role)}
                          className="cursor-pointer rounded-full px-2 py-1 text-xs font-medium text-secondary hover:bg-surface-hover hover:text-text"
                        >
                          {m.role === "ADMIN" ? t("demote_action") : t("promote_action")}
                        </button>
                        <IconButton
                          icon={<XIcon size={14} />}
                          size="sm"
                          onClick={() => setConfirmRemoveId(m.userId)}
                          className="text-secondary hover:bg-danger/10 hover:text-danger"
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3">
            <Button variant="danger" fullWidth onClick={() => setConfirmLeave(true)}>
              {t("leave_group_action")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-4">
          <MemberPicker
            selectedIds={pickedIds}
            onChange={setPickedIds}
            excludeIds={members.map((m) => m.userId)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMode("info")}>
              {t("cancel")}
            </Button>
            <Button onClick={handleAddMembers} loading={isAddingMembers} disabled={pickedIds.length === 0}>
              {t("group_add_members_action")}
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        onConfirm={handleLeave}
        title={t("leave_group_confirm_title")}
        description={t("leave_group_confirm_desc")}
        confirmLabel={t("leave_group_action")}
        cancelLabel={t("cancel")}
        danger
      />
      <ConfirmModal
        isOpen={!!confirmRemoveId}
        onClose={() => setConfirmRemoveId(null)}
        onConfirm={() => confirmRemoveId && handleRemoveMember(confirmRemoveId)}
        title={t("remove_member_confirm_title")}
        confirmLabel={t("remove_action")}
        cancelLabel={t("cancel")}
        danger
      />
    </Modal>
  );
};
