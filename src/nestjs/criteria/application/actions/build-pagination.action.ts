import { Injectable } from '@nestjs/common';
import { BuildPaginationActionCore } from '../../../../core';

@Injectable()
export class BuildPaginationAction extends BuildPaginationActionCore {
  constructor() {
    super();
  }
}
