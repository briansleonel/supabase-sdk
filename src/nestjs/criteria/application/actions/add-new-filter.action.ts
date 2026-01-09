import { Injectable } from '@nestjs/common';
import { AddNewFilterActionCore } from 'src/core';

@Injectable()
export class AddNewFilterAction extends AddNewFilterActionCore {
  constructor() {
    super();
  }
}
