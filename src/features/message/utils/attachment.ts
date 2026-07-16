import type { MediaRequest, MediaType } from "../types/message.types";
import { messageService } from "../service/messageService";

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
 * Upload các attachment đã chọn để lấy url thật (object storage) trước khi
 * gọi messageService.sendMessage — BE không nhận blob: URL.
 *
 * Gọi thẳng POST /v1/chat/messages/media (multipart, field "files", 1 lần
 * gọi cho tất cả file cùng lúc) qua messageService.uploadMessageMedia(),
 * theo đúng spec BE mới thêm — không còn mock setTimeout như trước.
 *
 * `onProgress` (0-100) là % TỔNG dung lượng của cả batch file trong request
 * multipart duy nhất đó — không tách được theo từng file riêng lẻ (xem
 * comment trong messageService.uploadMessageMedia).
 */
export const uploadAttachments = async (
  attachments: PendingAttachment[],
  onProgress?: (percent: number) => void,
): Promise<MediaRequest[]> => {
  if (attachments.length === 0) return [];
  const uploaded = await messageService.uploadMessageMedia(
    attachments.map((a) => a.file),
    onProgress,
  );
  // BE trả về CÙNG THỨ TỰ với file gửi lên (map 1-1 theo index) — không có id
  // nào khác để đối chiếu ngược, nên phải giữ nguyên thứ tự files.forEach ở
  // messageService.uploadMessageMedia khớp với attachments.map ở đây.
  return uploaded.map((u) => ({
    url: u.url,
    publicId: u.publicId, // BE cần lại field này để link đúng file đã upload
    type: u.type,
    fileName: u.fileName,
    size: u.size,
  }));
};
