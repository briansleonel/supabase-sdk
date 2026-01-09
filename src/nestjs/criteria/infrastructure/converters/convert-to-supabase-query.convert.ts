import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../symbols';
import { ConvertToSupabaseQueryCore } from '../../../../core';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ConvertToSupabaseQuery extends ConvertToSupabaseQueryCore {
  constructor(@Inject(SUPABASE_CLIENT) client: SupabaseClient) {
    super(client);
  }
}
