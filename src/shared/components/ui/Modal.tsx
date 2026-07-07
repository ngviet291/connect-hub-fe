import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from '../icons/Icons';
import { IconButton } from './IconButton';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${maxWidth} animate-slide-up rounded-none border-border bg-background shadow-2xl sm:animate-scale-in sm:rounded-2xl sm:border`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <h2 className="text-base font-semibold text-text">{title}</h2>
            <IconButton icon={<XIcon size={20} />} onClick={onClose} size="sm" />
          </div>
        )}
        {!title && (
          <IconButton icon={<XIcon size={20} />} onClick={onClose} size="sm" className="absolute right-3 top-3 z-10 bg-background/80" />
        )}
        {children}
      </div>
    </div>,
    document.body
  );
};
