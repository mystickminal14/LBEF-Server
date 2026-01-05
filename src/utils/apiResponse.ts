interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

class ApiResponse<T> {
  statusCode: number;
  data: T | null;
  message: string;
  success: boolean;
  pagination?: Pagination;

  constructor(
    statusCode: number,
    data: T | null,
    message: string = "Success",
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;

    if (pagination) {
      this.pagination = pagination;
    }
  }
}

export { ApiResponse };
