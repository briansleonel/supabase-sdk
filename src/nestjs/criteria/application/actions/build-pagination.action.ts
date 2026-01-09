import { Injectable } from '@nestjs/common';
import { BuildPaginationActionCore } from 'src/core';

@Injectable()
export class BuildPaginationAction extends BuildPaginationActionCore {
  constructor() {
    super();
  }
}
