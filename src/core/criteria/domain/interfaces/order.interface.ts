import { OrderDirectionEnum } from '../enums/order-direction.enum';

export interface IOrder {
  field: string;
  direction: OrderDirectionEnum;
}
