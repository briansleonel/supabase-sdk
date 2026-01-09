import {
  AuthTokenResponsePassword,
  SupabaseClient,
} from '@supabase/supabase-js';
import { get, isEmpty } from 'lodash';
import { SupabaseOptionsCore } from 'src/core/criteria/domain/interfaces/supabase-options-core.interface';

export class SupabaseBaseClientCore {
  protected readonly _withSoftDelete: string[];

  constructor(
    protected readonly _client: SupabaseClient,
    protected readonly options: SupabaseOptionsCore,
  ) {
    this._withSoftDelete = options?.tables || [];
  }

  async rpc<T>(name: string, params: object) {
    try {
      const { data, error } = await this._client.rpc(name, params);

      if (error) {
        throw error;
      }

      return data as T;
    } catch (error) {
      throw error;
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<AuthTokenResponsePassword> {
    return await this._client.auth.signInWithPassword({
      email,
      password,
    });
  }

  async create<T>(
    table: string,
    newData: T,
    schema?: string,
    columns?: string,
  ): Promise<T> {
    const schemaSelected = isEmpty(schema) ? 'public' : (schema as string);
    const { data, error } = await this._client
      .schema(schemaSelected)
      .from(table)
      .insert(newData)
      .select(columns ? columns : '*');
    if (error) throw new Error(JSON.stringify(error));

    return get(data, '[0]') as T;
  }

  async getById<T>(
    table: string,
    id: string,
    columns?: string,
    checkSoftDelete = true,
  ): Promise<T> {
    const columnSelected = isEmpty(columns) ? `*` : columns;

    const query = this._client.from(table).select(columnSelected).eq('id', id);

    if (this._withSoftDelete.includes(table) && checkSoftDelete)
      query.is('deleted_at', null);

    const { data, error } = await query.single();

    if (error) throw new Error(JSON.stringify(error));

    return data as T;
  }

  async update<T>(
    table: string,
    id: string,
    newdata: object,
    relation?: string,
    columns?: string,
  ): Promise<T> {
    const relationSelected = isEmpty(relation) ? `id` : (relation as string);
    const { data, error } = await this._client
      .from(table)
      .update(newdata)
      .eq(relationSelected, id)
      .select(columns ? columns : '*');

    if (error) throw new Error(JSON.stringify(error));

    return get(data, '[0]') as T;
  }

  async delete<T>(
    table: string,
    id: string,
    idField: string = 'id',
  ): Promise<T> {
    const { data, error } = await this._client
      .from(table)
      .delete()
      .eq(idField, id);

    if (error) throw new Error(JSON.stringify(error));

    return data as T;
  }

  async getByRelation<T>(
    table: string,
    relation: string,
    relationId: string,
    columns?: string,
    checkSoftDelete = true,
  ): Promise<T> {
    const columnSelected = isEmpty(columns) ? `*` : columns;
    const query = this._client
      .from(table)
      .select(columnSelected)
      .eq(relation, relationId);

    if (this._withSoftDelete.includes(table) && checkSoftDelete)
      query.is('deleted_at', null);

    const { data, error } = await query;

    if (error) throw new Error(JSON.stringify(error));

    return data as T;
  }

  async getByRelationWithCount<T>(
    table: string,
    relation: string,
    relationId: string,
    columns: string = '*',
    limit: number = 0,
    offset: number = 0,
    filters?: {
      dateRange?: { [key: string]: [string | Date, string | Date] };
      match?: { [key: string]: string };
    },
  ): Promise<{ data: T; count: number }> {
    let query = this._client
      .from(table)
      .select(columns, { count: 'exact' })
      .eq(relation, relationId);

    if (filters?.dateRange) {
      Object.entries(filters.dateRange).forEach(([column, [start, end]]) => {
        if (!isEmpty(start) && !isEmpty(end)) {
          query = query.gte(column, start).lte(column, end);
        }
      });
    }

    if (filters?.match) {
      Object.entries(filters.match).forEach(([column, value]) => {
        if (!isEmpty(value)) {
          query = query.eq(column, value);
        }
      });
    }

    if (limit > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    if (this._withSoftDelete.includes(table)) {
      query = query.is('deleted_at', null);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(JSON.stringify(error));

    return { data: data as T, count: count ? count : 0 };
  }

  async updateByMatch<T>(table: string, data: object, where: object) {
    const { data: response, error } = await this._client
      .from(table)
      .update(data)
      .match(where)
      .select();

    if (error) throw new Error(JSON.stringify(error));

    return response as T;
  }

  async getAll<T>(table: string, columns?: string, schema?: string) {
    const columnSelected = isEmpty(columns) ? `*` : columns;
    const schemaSelected = isEmpty(schema) ? 'public' : (schema as string);

    const query = this._client
      .schema(schemaSelected)
      .from(table)
      .select(columnSelected);

    if (this._withSoftDelete.includes(table)) query.is('deleted_at', null);

    const { data, error } = await query;

    if (error) throw new Error(JSON.stringify(error));

    return data as T;
  }

  async getByQuery<T>(
    table: string,
    query: object,
    columns?: string,
    checkSoftDelete = true,
  ): Promise<T> {
    const columnSelected = isEmpty(columns) ? `*` : columns;

    const queryDb = this._client
      .from(table)
      .select(columnSelected)
      .match(query);

    if (this._withSoftDelete.includes(table) && checkSoftDelete)
      queryDb.is('deleted_at', null);

    const { data, error } = await queryDb;

    if (error) throw new Error(JSON.stringify(error));

    return data as T;
  }

  async deleteByIntermediateTable<T>(
    table: string,
    idOne: string,
    idFieldOne: string = 'id',
    idTwo: string,
    idFieldTwo: string = 'id',
  ): Promise<T> {
    const { data, error } = await this._client
      .from(table)
      .delete()
      .eq(idFieldOne, idOne)
      .eq(idFieldTwo, idTwo);

    if (error) throw new Error(JSON.stringify(error));

    return data as T;
  }

  async getByGroupIds<T>(
    table: string,
    ids: Array<string>,
    query?: object,
    idField: string = 'id',
    columns?: string,
  ): Promise<Array<T>> {
    const columnSelected = isEmpty(columns) ? `*` : columns;

    const { data, error } = await this._client
      .from(table)
      .select(columnSelected)
      .in(idField, ids)
      .match(query ?? {});

    if (error) throw new Error(JSON.stringify(error));

    return data as Array<T>;
  }

  async getOneByQuery<T>(
    table: string,
    query: object,
    columns?: string,
    checkSoftDelete = true,
  ): Promise<T> {
    const columnSelected = isEmpty(columns) ? `*` : columns;

    const queryDb = this._client
      .from(table)
      .select(columnSelected)
      .match(query);

    if (this._withSoftDelete.includes(table) && checkSoftDelete)
      queryDb.is('deleted_at', null);

    const { data } = await queryDb.single();

    return data as T;
  }

  async getJoin<T>(
    table: string,
    tableJoin: string,
    id: string,
    idField: string = 'id',
    columns?: string,
  ) {
    const columnSelected = isEmpty(columns) ? `*` : columns;

    const { data, error } = await this._client
      .from(table)
      .select(`${columnSelected} , ${tableJoin} ( * )`)
      .eq(idField, id);

    if (error) {
      throw new Error(error.message);
    }

    return data as T;
  }

  async deleteByQuery<T>(table: string, query: object): Promise<T> {
    const { data, error } = await this._client
      .from(table)
      .delete()
      .match(query);

    if (error) throw new Error(JSON.stringify(error));

    return data as T;
  }

  async getAndExclude<T>(
    table: string,
    matchQuery: object,
    excludeFields: object,
    columns?: string,
  ) {
    const columnSelected = isEmpty(columns) ? `*` : columns;

    let query = this._client
      .from(table)
      .select(columnSelected)
      .is('deleted_at', null)
      .match(matchQuery);

    for (const [key, value] of Object.entries(excludeFields)) {
      query = query.neq(key, value);
    }

    const { data, error } = await query;

    if (error) throw new Error(JSON.stringify(error));

    return data as T;
  }

  async getOrFilter<T>(
    table: string,
    columnFilter: string,
    values: string[],
    columns?: string,
  ): Promise<T> {
    const columnSelected = isEmpty(columns) ? `*` : columns;

    const { data, error } = await this._client
      .from(table)
      .select(columnSelected)
      .in(columnFilter, values);

    if (error) {
      throw new Error(JSON.stringify(error));
    }

    return data as T;
  }

  async getByQueryFilter<T>(table: string, query: object, columns?: string) {
    const columnSelected = isEmpty(columns) ? `*` : columns;

    let queryBuilder = this._client.from(table).select(columnSelected);

    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        queryBuilder = queryBuilder.in(key, value);
      } else if (typeof value === 'object' && value !== null) {
        for (const [operator, operand] of Object.entries(value)) {
          switch (operator) {
            case 'eq':
              queryBuilder = queryBuilder.eq(key, operand);
              break;
            case 'neq':
              queryBuilder = queryBuilder.neq(key, operand);
              break;
            case 'gte':
              queryBuilder = queryBuilder.gte(key, operand);
              break;
            case 'lte':
              queryBuilder = queryBuilder.lte(key, operand);
              break;
            case 'is':
              queryBuilder = queryBuilder.is(key, operand);
              break;
            case 'not':
              if (typeof operand === 'object' && operand !== null) {
                for (const [subOperator, subOperand] of Object.entries(
                  operand,
                )) {
                  if (subOperator === 'is') {
                    queryBuilder = queryBuilder.not(key, 'is', subOperand);
                  }
                }
              }
              break;
            default:
              throw new Error(`Unsupported operator: ${operator}`);
          }
        }
      } else {
        queryBuilder = queryBuilder.eq(key, value);
      }
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(JSON.stringify(error));
    }

    return data as T[];
  }

  async getCount(
    tableName: string,
    filters: Record<string, any> = {},
    countColumn: string = '*',
  ): Promise<number> {
    const { count, error } = await this._client
      .from(tableName)
      .select(countColumn, { count: 'exact', head: true })
      .match(filters);

    if (error) throw new Error(JSON.stringify(error));

    return count || 0;
  }

  async upsert<T>(
    table: string,
    newData: object,
    columns?: string,
    onConflict?: string,
  ): Promise<T> {
    const columnSelected = isEmpty(columns) ? `*` : columns;
    const { data, error } = await this._client
      .from(table)
      .upsert(newData, {
        ignoreDuplicates: false,
        onConflict: onConflict ? onConflict : 'id',
      })
      .select(columnSelected);

    if (error) throw new Error(JSON.stringify(error));

    return data as T;
  }
}
