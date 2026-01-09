import { SupabaseBaseClientCore } from "../../../client/supabase-base.client";
import { ConvertToSupabaseQueryCore } from "../../infrastrcuture/converters/convert-to-supabase-query.converter";
import { CriteriaDto } from "../../domain/dto/criteria.dto";
import { IFilterByPagination } from "../../domain/interfaces/filter-by-pagination";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

export class SupabaseQueryServiceCore {
  constructor(
    private readonly convertToSupabaseQuery: ConvertToSupabaseQueryCore,
    private readonly _supabaseClient: SupabaseBaseClientCore,
  ) {}

  async matching<T>(criteria: CriteriaDto): Promise<IFilterByPagination<T>> {
    try {
      const baseQuery = this.convertToSupabaseQuery.convert(criteria);

      const { limit, offset } = this.parseLimitAndOffset(criteria);

      const dataPromise = baseQuery.range(offset, offset + limit - 1);

      const isHeavyView = criteria.table === 'view_calls_with_contacts';

      if (isHeavyView) {
        return await this.matchingWithRPC<T>(criteria, limit, offset);
      }

      const promises = [dataPromise];

      const [dataResult] = await Promise.all(promises);

      const { data, error, count } = dataResult;

      if (error) throw error;

      return this.buildPaginatedResponse(
        data as T[],
        count ?? 0,
        limit,
        offset,
      );
    } catch (error) {
      console.log(
        `SupabaseQueryService.matching error: ${JSON.stringify(error)}`,
      );
      throw error;
    }
  }

  private async matchingWithRPC<T>(
    criteria: CriteriaDto,
    limit: number,
    offset: number,
  ): Promise<IFilterByPagination<T>> {
    const params = {
      p_filters: criteria.filters ?? [],
      p_order_by: criteria.orderBy?.field || null,
      p_order_direction: criteria.orderBy?.direction?.toUpperCase() || 'ASC',
      p_limit: limit,
      p_offset: offset,
    };

    const { data, error }: PostgrestSingleResponse<T[]> =
      await this._supabaseClient.rpc('get_calls_with_contacts_lateral', params);

    if (error) throw error;

    const count = await this._supabaseClient.rpc<number>(
      'count_calls_with_filters',
      {
        p_filters: criteria.filters ?? [],
      },
    );

    return this.buildPaginatedResponse(data as T[], count ?? 0, limit, offset);
  }

  private parseLimitAndOffset(criteria: CriteriaDto): {
    limit: number;
    offset: number;
  } {
    const rawLimit = Number(criteria.limit ?? 0);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 50;

    const rawOffset = Number(criteria.offset ?? 0);
    const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;

    return { limit, offset };
  }

  private buildPaginatedResponse<T>(
    data: T[],
    totalRows: number,
    limit: number,
    offset: number,
  ): IFilterByPagination<T> {
    const totalPages =
      totalRows > 0 && limit > 0 ? Math.ceil(totalRows / limit) : 0;

    const currentPage =
      totalRows > 0 && limit > 0 ? Math.floor(offset / limit) + 1 : 1;

    return {
      data: data ?? [],
      pagination: {
        page: currentPage,
        total_rows: totalRows,
        total_pages: totalPages,
      },
    };
  }
}
