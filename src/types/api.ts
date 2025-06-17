export interface ErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages?: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
}

export interface RouteParams {
  params: Record<string, string>;
}

export interface RouteContext {
  params: Record<string, string>;
} 