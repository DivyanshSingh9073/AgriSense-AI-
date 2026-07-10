/** Standard shape returned by the AgriSense API for a single resource. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Standard shape returned by the AgriSense API for list endpoints. */
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/** Normalized error shape surfaced to the UI from the axios interceptor. */
export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, string[]>;
}

export type Theme = 'light' | 'dark' | 'system';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
