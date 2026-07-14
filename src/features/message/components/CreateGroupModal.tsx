import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal } from "../../../shared/components/ui/Modal";
import { Input } from "../../../shared/components/ui/Input";
import { Button } from "../../../shared/components/ui/Button";
import { MemberPicker } from "./MemberPicker";
import { conversationService } from "../service/conversationService";
import { useToast } from "../../../shared/components/ui/Toast";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** POST /v1/conversations/group — trước đây có service nhưng không màn hình nào gọi tới. */
export const CreateGroupModal = ({ isOpen, onClose }: CreateGroupModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const reset = () => {
    setName("");
    setMemberIds([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (memberIds.length < 2) return; // BE yêu cầu tối thiểu 2 thành viên khác
    setIsCreating(true);
    try {
      const conv = await conversationService.createGroupConversation({
        name: name.trim() || undefined,
        members: memberIds,
      });
      reset();
      onClose();
      navigate(`/messages/${conv.conversationId}`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : t("group_create_error"), "error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("create_group_title")}>
      <div className="flex flex-col gap-4 p-4">
        <Input
          label={t("group_name_label")}
          placeholder={t("group_name_placeholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-secondary">
            {t("group_members_label")}
          </label>
          <MemberPicker selectedIds={memberIds} onChange={setMemberIds} />
          {memberIds.length > 0 && memberIds.length < 2 && (
            <p className="text-xs text-danger">{t("group_members_min_hint")}</p>
          )}
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            loading={isCreating}
            disabled={memberIds.length < 2}
          >
            {t("create_group_action")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
