export interface PagingResponse<T> {
  data: T[];
  paging?: {
    totalRecords: number;
    pageSize: number;
    pageNumber: number;
  };
}

export interface DataResponse<T> {
  data: T;
}
