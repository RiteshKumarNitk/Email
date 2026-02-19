
export interface PageParams {
    params: { [key: string]: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export type SortOrder = 'asc' | 'desc';

export interface PaginationResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
