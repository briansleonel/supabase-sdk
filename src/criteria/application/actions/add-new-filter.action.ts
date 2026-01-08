import { Injectable } from '@nestjs/common';
import { IFilters } from 'src/criteria/domain/interfaces/filters.interface';

@Injectable()
export class AddNewFilterAction {
  constructor() {}

  execute(filters: string, newFilter: IFilters) {
    const parsedFilters: IFilters[] = JSON.parse(filters);

    parsedFilters.push(newFilter);

    return JSON.stringify(parsedFilters);
  }
}
