import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger,
}: ConfirmModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
    <div className="p-5">
      <h2 className="text-base font-semibold text-text">{title}</h2>
      {description && <p className="mt-1.5 text-sm text-secondary">{description}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={danger ? 'bg-danger text-white hover:bg-danger/90' : ''}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
);
