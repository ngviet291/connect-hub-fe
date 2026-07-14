import type { MediaRequest, MediaType } from "../types/message.types";

/**
 * Preview LOCAL cho file người dùng vừa chọn, TRƯỚC khi upload thật.
 * BE (SendMessageRequest.MediaRequest) chỉ nhận url/type/fileName/size của
 * file ĐÃ upload lên object storage — blob: URL ở đây KHÔNG gửi thẳng lên BE.
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

/**
 * Upload các attachment đã chọn để lấy url thật trước khi gọi
 * messageService.sendMessage (BE không nhận blob: URL).
 *
 * TODO: module post hiện cũng đang mock upload y hệt kiểu này
 * (features/media/mediaService.ts — `URL.createObjectURL` rồi trả thẳng
 * lại), tức là BE chưa có endpoint upload object-storage thật nào được xác
 * nhận trong toàn bộ codebase FE tại thời điểm này. Khi có endpoint thật
 * (vd POST /v1/media/upload multipart), thay thân hàm này bằng 1 lần gọi
 * axiosClient.post(...) cho mỗi file — giữ nguyên signature để không phải
 * sửa lại MessageInput/ChatPage.
 */
export const uploadAttachments = async (
  attachments: PendingAttachment[],
): Promise<MediaRequest[]> => {
  return Promise.all(
    attachments.map(
      (a) =>
        new Promise<MediaRequest>((resolve) => {
          // Giả lập độ trễ upload để UX (spinner gửi tin) không bị "chớp".
          setTimeout(() => {
            resolve({
              url: a.url,
              type: a.type,
              fileName: a.file.name,
              size: a.file.size,
            });
          }, 300);
        }),
    ),
  );
};
