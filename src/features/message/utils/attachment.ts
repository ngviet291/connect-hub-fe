import type { MediaType } from "../types/message.types";

/**
 * Preview LOCAL cho file người dùng vừa chọn, TRƯỚC khi upload thật.
 * BE (SendMessageRequest.MediaRequest) chỉ nhận url/type/fileName/size của
 * file ĐÃ upload lên object storage — blob: URL ở đây KHÔNG gửi thẳng lên BE.
 *
 * TODO: cần 1 mediaUploadService (tương tự flow upload ảnh của module post)
 * để upload `file` lấy về url thật trước khi gọi messageService.sendMessage.
 * Xem module post để tái dùng đúng endpoint/service upload đã có sẵn,
 * không tự chế 1 API upload mới ở đây.
 */
export interface PendingAttachment {
  id: string;
  url: string; // blob: URL — chỉ dùng để preview
  type: MediaType;
  file: File;
}

export const createAttachment = (file: File): PendingAttachment => {
  const url = URL.createObjectURL(file);
  const type: MediaType = file.type.startsWith("video") ? "VIDEO" : "IMAGE";
  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    url,
    type,
    file,
  };
};

export const revokeAttachment = (url: string) => {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
};
