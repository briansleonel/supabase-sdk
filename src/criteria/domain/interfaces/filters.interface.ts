import { OperatorEnum } from '../enums/operator.enum';

export interface IFilters {
  field: string;
  operator: OperatorEnum;
  value: string | number | string[] | number[] | Date | null;
}
