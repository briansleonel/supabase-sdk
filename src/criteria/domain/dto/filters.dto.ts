import { BadRequestException } from '@nestjs/common';
import { IFilters } from '../interfaces/filters.interface';
import { OperatorEnum } from '../enums/operator.enum';

export class FiltersDto implements IFilters {
  field: string;
  operator: OperatorEnum;
  value: string | number | string[] | number[] | Date | null;

  constructor(field: string, operator: string, value: any) {
    this.field = field;
    this.operator = this.validateOperator(operator);
    this.value = this.validateValue(value);
  }

  private validateOperator(operator: string): OperatorEnum {
    if (!(operator.toUpperCase() in OperatorEnum)) {
      throw new BadRequestException(`Invalid operator '${operator}'`);
    }
    return OperatorEnum[operator.toUpperCase() as keyof typeof OperatorEnum];
  }

  private validateValue(
    value: any,
  ): string | number | string[] | number[] | Date | null {
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date ||
      (Array.isArray(value) &&
        value.every(
          (val) => typeof val === 'string' || typeof val === 'number',
        ))
    ) {
      return value;
    }
    throw new BadRequestException('Invalid value type');
  }
}
