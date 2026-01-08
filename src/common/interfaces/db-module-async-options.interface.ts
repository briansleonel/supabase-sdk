import { SupabaseModuleOptions } from './db-module-options.interface';

export interface SupabaseModuleAsyncOptions {
  useFactory: (
    ...args: any[]
  ) => Promise<SupabaseModuleOptions> | SupabaseModuleOptions;
  inject?: any[];
}
