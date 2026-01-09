import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT, SUPABASE_OPTIONS } from '../symbols';
import { SupabaseOptionsCore } from '../../core/criteria/domain/interfaces/supabase-options-core.interface';
import { SupabaseBaseClientCore } from '../../core/client/supabase-base.client';

@Injectable()
export class SupabaseBaseClient extends SupabaseBaseClientCore {
  constructor(
    @Inject(SUPABASE_CLIENT) client: SupabaseClient,
    @Inject(SUPABASE_OPTIONS) options: SupabaseOptionsCore,
  ) {
    super(client, options);
  }
}
