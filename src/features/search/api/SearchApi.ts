import axiosClient from '../../../config/axiosClient';
import type { ApiResponse, CursorResponse } from '../../../shared/types/api.types';
import type { UserProfile } from '../../user/types/user.types';
import { getErrorMessage } from '../../../constants/errorMessage';

const SEARCH_USERS_ENDPOINT = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'}/v1/search/users`;
const ADMIN_USERS_ENDPOINT = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'}/v1/admin/users/allusers`;

interface UserSummaryResponse {
	id: string;
	username: string;
	fullName: string;
	avatarUrl?: string;
}

const unwrap = <T,>(payload: ApiResponse<T> | T): T => {
	if (payload && typeof payload === 'object' && 'data' in payload) {
		return (payload as ApiResponse<T>).data;
	}
	return payload as T;
};

const unwrapUsers = (payload: ApiResponse<CursorResponse<UserProfile>> | CursorResponse<UserProfile>): UserProfile[] => {
	const data = 'data' in payload ? payload.data : payload;
	return Array.isArray(data) ? data : data?.content ?? [];
};

const mapSummaryToProfile = (user: UserSummaryResponse): UserProfile => ({
	id: user.id,
	username: user.username,
	fullName: user.fullName,
	avatarUrl: user.avatarUrl,
	bio: undefined,
	coverUrl: undefined,
	website: undefined,
	roles: ['ROLE_USER'],
	createdAt: new Date(0).toISOString(),
	location: undefined,
	followersCount: 0,
	followingCount: 0,
	postsCount: 0,
	isFollowing: false,
	isPrivate: false,
	isVerified: false,
});

const unwrapSummaryUsers = (
	payload: ApiResponse<CursorResponse<UserSummaryResponse>> | CursorResponse<UserSummaryResponse>,
): CursorResponse<UserProfile> => {
	const data = 'data' in payload ? payload.data : payload;
	const content = Array.isArray(data) ? data : data?.content ?? [];

	return {
		content: content.map(mapSummaryToProfile),
		nextCursor: data?.nextCursor ?? null,
		hasNext: data?.hasNext ?? false,
	};
};

export const searchApi = {
	searchUsers: async (keyword: string, cursor?: string | null, limit = 20): Promise<CursorResponse<UserProfile>> => {
		const normalizedKeyword = keyword.trim();
		if (!normalizedKeyword) {
			return { content: [], nextCursor: null, hasNext: false };
		}

		try {
			const response = (await axiosClient.get(
				SEARCH_USERS_ENDPOINT,
				{ params: { keyword: normalizedKeyword, limit, ...(cursor ? { cursor } : {}) } },
			)) as { data: ApiResponse<CursorResponse<UserProfile>> | CursorResponse<UserProfile> };

			const data = response.data;
			const content = 'data' in data ? data.data : data;
			return {
				content: content.content.map((user) => mapSummaryToProfile(user as unknown as UserSummaryResponse)),
				nextCursor: content.nextCursor,
				hasNext: content.hasNext,
			};
		} catch (error) {
			throw new Error(getErrorMessage(error, 'Không thể tìm kiếm người dùng'));
		}
	},

	getAllUsers: async (size = 20): Promise<UserProfile[]> => {
		try {
			const users: UserProfile[] = [];
			let cursor: string | null = null;

			for (let page = 0; page < 10; page += 1) {
				const response = (await axiosClient.get(
					ADMIN_USERS_ENDPOINT,
					{ params: { size, ...(cursor ? { cursor } : {}) } },
				)) as { data: ApiResponse<CursorResponse<UserProfile>> | CursorResponse<UserProfile> };

				const data: ApiResponse<CursorResponse<UserProfile>> | CursorResponse<UserProfile> = response.data;
				const pageUsers = unwrapSummaryUsers(data).content;
				users.push(...pageUsers);

				const payload: CursorResponse<UserProfile> = 'data' in data ? data.data : data;
				if (!payload || !payload.hasNext || !payload.nextCursor) {
					break;
				}
				cursor = payload.nextCursor;
			}

			return users;
		} catch (error) {
			throw new Error(getErrorMessage(error, 'Không thể tải danh sách người dùng'));
		}
	},
};
