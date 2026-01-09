import { isUndefined } from 'lodash';
import { IFilters } from '../interfaces/filters.interface';
import { IFilterById } from '../interfaces/filter-by-id.interface';
import { IPaginationData } from '../interfaces/pagination-data.interface';
import { PaginationDto } from './pagination.dto';
import { FiltersDto } from './filters.dto';
import { OrderDto } from './order.dto';
import { IOrder } from '../interfaces/order.interface';

export class CriteriaDto {
  table: string;
  columns: string;
  filters?: IFilters[];
  orderBy?: IOrder;
  limit?: number;
  offset?: number;

  constructor(
    table: string,
    columns: string,
    filters: string | undefined,
    orderBy: string | undefined,
    orderDirection: string | undefined,
    limit: string | undefined,
    offset: string | undefined,
    filter?: IFilterById,
  ) {
    this.table = table;
    this.columns = columns;
    this.filters = this.parseFilters(filters, filter);
    this.orderBy = this.parseOrder(orderBy, orderDirection);
    const pagination: IPaginationData = new PaginationDto(limit, offset);
    this.limit = pagination.limit;
    this.offset = pagination.offset;
  }

  private parseFilters(
    filters: string | undefined,
    filter?: IFilterById,
  ): IFilters[] | undefined {
    let parsedFilters = [];
    if (isUndefined(filters) && isUndefined(filter)) return undefined;

    if (!isUndefined(filters)) {
      parsedFilters = JSON.parse(filters).map(
        (filter: any) =>
          new FiltersDto(filter.field, filter.operator, filter.value),
      );
    }

    if (!isUndefined(filter))
      parsedFilters.push(new FiltersDto(filter.field, 'EQUAL', filter.value));
    return parsedFilters;
  }

  private parseOrder(
    orderBy: string | undefined,
    orderDirection: string | undefined,
  ): IOrder | undefined {
    if (isUndefined(orderBy) || isUndefined(orderDirection)) return undefined;
    return new OrderDto(orderBy, orderDirection);
  }
}
