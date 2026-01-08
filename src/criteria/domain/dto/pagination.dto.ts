import { BadRequestException } from '@nestjs/common';
import { IPaginationData } from '../interfaces/pagination.interface';
export class PaginationDto implements IPaginationData {
  limit: number;
  offset: number;

  constructor(limit: string | undefined, offset: string | undefined) {
    if (limit === undefined && offset !== undefined) {
      throw new BadRequestException('Offset provided without a limit');
    }
    if (limit !== undefined && offset === undefined) {
      throw new BadRequestException('Limit provided without an offset');
    }

    const parsedLimit = limit ? parseInt(limit, 10) : 0;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    if (parsedLimit < 0 || parsedOffset < 0) {
      throw new BadRequestException('Limit and offset must be non-negative');
    }

    this.limit = parsedLimit;
    this.offset = parsedOffset;
  }
}
