import type { PostMedia } from '../post/types/post.types';

/**
 * Mock media upload service. In production this should upload the file to
 * object storage (S3/Cloudinary/etc.) and return the resulting public URL.
 */
export const mediaService = {
  uploadFile: async (file: File): Promise<PostMedia> => {
    // TODO: thay bằng upload thật, ví dụ:
    // const form = new FormData(); form.append('file', file);
    // return api.post('/media/upload', form).then(r => r.data);
    const url = URL.createObjectURL(file);
    return {
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url,
      type: file.type.startsWith('video') ? 'VIDEO' : 'IMAGE',
    };
  },

  revoke: (url: string) => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
  },
};
