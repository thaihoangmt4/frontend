// Application-wide type definitions

export type ApiResponse<T> = {
  data: T;
  message: string;
  status: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiError = {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
};
