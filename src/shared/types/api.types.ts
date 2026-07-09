export interface ApiError {
  message: string;
  status: number;
}

export interface CursorResponse<T> {
  content: T[];
  nextCursor: string | null;
  hasNext: boolean;
}
// Interface đại diện cho cấu trúc bao bọc (Wrapper) của Backend
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  page: number; // current page (0-indexed)
  last: boolean;
}
export interface ErrorResponse {
  code: number;
  message: string;
}

export interface BackendErrorResponse {
  timestamp: string;
  status: number;
  error: string; // Chứa chuỗi thông báo lỗi cụ thể (ví dụ: "Invalid password")
  message: string;
  path: string;
  errors?: Record<string, string>; // Có thể có thêm trường 'errors' chứa chi tiết lỗi validation nếu có
}