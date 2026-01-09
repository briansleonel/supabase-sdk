import { isNull } from 'lodash';
import { IFilterByPagination } from '../../domain/interfaces/filter-by-pagination';
import { IRpcResponse } from '../../domain/interfaces/rpc-response.interface';

export class BuildPaginationActionCore {
  execute<T>(
    rpcResponse: IRpcResponse<T>,
    limit: number,
    offset: number,
  ): IFilterByPagination<T> {
    const totalRows = isNull(rpcResponse?.total_rows)
      ? 0
      : rpcResponse?.total_rows;

    const totalPages = Math.ceil(totalRows / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return {
      data: rpcResponse?.data,
      pagination: {
        total_rows: totalRows,
        page: currentPage,
        total_pages: totalPages,
      },
    };
  }
}
