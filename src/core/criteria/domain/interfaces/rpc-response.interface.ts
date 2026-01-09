export interface IRpcResponse<T> {
  data: T[];
  total_rows: number;
}
