import { IFilters } from '../../domain/interfaces/filters.interface';

export class AddNewFilterActionCore {
  constructor() {}

  execute(filters: string, newFilter: IFilters) {
    const parsedFilters: IFilters[] = JSON.parse(filters);
    parsedFilters.push(newFilter);

    return JSON.stringify(parsedFilters);
  }
}
