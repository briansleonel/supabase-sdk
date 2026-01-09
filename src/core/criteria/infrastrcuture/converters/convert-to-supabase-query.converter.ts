import { SupabaseClient } from '@supabase/supabase-js';
import { CriteriaDto } from '../../domain/dto/criteria.dto';
import { isEqual } from 'lodash';
import { OperatorEnum } from '../../domain/enums/operator.enum';
import { OrderDirectionEnum } from '../../domain/enums/order-direction.enum';

export class ConvertToSupabaseQueryCore {
  private tablesWithSoftDelete = [
    'campaigns',
    'contacts',
    'cards',
    'view_cards_contacts',
    'agents',
  ];

  constructor(protected readonly client: SupabaseClient) {}

  convert(criteria: CriteriaDto) {
    const getCount =
      criteria.table !== 'view_calls_with_contacts'
        ? ({ count: 'exact' } as const)
        : undefined;

    let query: any = this.client
      .from(criteria.table)
      .select(criteria.columns, getCount);

    if (this.tablesWithSoftDelete.includes(criteria.table)) {
      query = query.is('deleted_at', null);
    }

    for (const filter of criteria.filters ?? []) {
      if (isEqual(filter.operator, OperatorEnum.ARRAY_INTERSECTS)) {
        query = this.applyArrayFilter(query, filter, filter.operator);
        continue;
      }

      query = query.filter(
        filter.field,
        filter.operator,
        this.formatValue(filter.value),
      );
    }

    if (criteria.orderBy) {
      query = query.order(criteria.orderBy.field, {
        ascending: criteria.orderBy.direction === OrderDirectionEnum.ASCENDENT,
      });
    }

    return query;
  }

  private applyArrayFilter(query: any, filter: any, operator: OperatorEnum) {
    return query.filter(
      filter.field,
      operator,
      `{${Array.isArray(filter.value) ? filter.value.join(',') : filter.value}}`,
    );
  }

  private formatValue(
    value: string | number | string[] | number[] | Date | null,
  ): string | null {
    if (value === null) {
      return null;
    }
    if (Array.isArray(value)) {
      return `(${value.join(',')})`;
    }
    return value.toString();
  }
}
