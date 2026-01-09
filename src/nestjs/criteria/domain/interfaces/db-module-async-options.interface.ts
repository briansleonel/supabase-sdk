import { SupabaseOptionsCore } from '../../../../core/criteria/domain/interfaces/supabase-options-core.interface';

export interface SupabaseModuleAsyncOptions {
  useFactory: (
    ...args: any[]
  ) => Promise<SupabaseOptionsCore> | SupabaseOptionsCore;
  inject?: any[];
}
