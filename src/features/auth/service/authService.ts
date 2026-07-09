import publicClient from '../../../config/publicClient';
import { API_ENDPOINTS } from '../../../config/endpoints';

interface RefreshTokenRequest {
  refreshToken: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Gọi publicClient (không kèm Authorization header) để refresh token.
 * Tách riêng khỏi axiosClient tránh circular dependency.
 */
export const authService = {
  refreshToken: async (data: RefreshTokenRequest): Promise<TokenResponse> => {
    const res = await publicClient.post<{ data: TokenResponse }>(
      API_ENDPOINTS.REFRESH_TOKEN,
      data,
    );
    return res.data.data;
  },
};
