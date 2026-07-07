import type { MessageAttachment } from '../types/message.types';

export const createAttachment = (file: File): MessageAttachment => {
  // TODO: thay bằng upload thật lên object storage
  const url = URL.createObjectURL(file);
  const type: MessageAttachment['type'] = file.type.startsWith('video') ? 'VIDEO' : 'IMAGE';
  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    url,
    type,
  };
};

export const revokeAttachment = (url: string) => {
  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
};
