import { BadRequestException } from '@nestjs/common';
import { IOrder } from '../interfaces/order.interface';
import { OrderDirectionEnum } from '../enums/order-direction.enum';

export class OrderDto implements IOrder {
  field: string;
  direction: OrderDirectionEnum;

  constructor(field: string, direction: string) {
    this.field = field;
    this.direction = this.validateDirection(direction);
  }

  private validateDirection(direction: string): OrderDirectionEnum {
    if (!(direction in OrderDirectionEnum)) {
      throw new BadRequestException(`Invalid order direction '${direction}'`);
    }
    return OrderDirectionEnum[direction as keyof typeof OrderDirectionEnum];
  }
}
