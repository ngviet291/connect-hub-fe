export interface ApiError {
  message: string;
  status: number;
}

export interface CursorResponse<T> {
  content: T[];
  nextCursor: string | null;
  hasNext: boolean;
}
