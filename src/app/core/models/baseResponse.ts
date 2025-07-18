export interface BaseResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp: string;
    statusCode: number;
}

export interface errorResponse<T> {
    success: boolean;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    message: string;
    errors: T;
}

export interface pagination{
    page: number;
    limit: number;
    total: number;
    pages: number;
}