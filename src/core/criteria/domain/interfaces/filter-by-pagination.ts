import { IPagination } from "./pagination.interface";


export interface IFilterByPagination<T> {
  data: T[];
  pagination: IPagination;
}
