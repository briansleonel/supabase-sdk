import { DynamicModule, Module } from '@nestjs/common';
import { SupabaseOptionsCore } from '../core/criteria/domain/interfaces/supabase-options-core.interface';
import { SUPABASE_CLIENT, SUPABASE_OPTIONS } from './symbols';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseClient } from './clients/supabase-base-client';
import { SupabaseModuleAsyncOptions } from './criteria/domain/interfaces/db-module-async-options.interface';

@Module({})
export class SupabaseModule {
  static forRoot(options: SupabaseOptionsCore): DynamicModule {
    return {
      module: SupabaseModule,
      global: true,
      providers: [
        {
          provide: SUPABASE_CLIENT,
          useFactory: (): SupabaseClient => {
            return createClient(options.databaseUrl, options.databaseKey);
          },
        },
        {
          provide: SUPABASE_OPTIONS,
          useValue: options,
        },
        SupabaseBaseClient,
      ],
      exports: [SUPABASE_CLIENT, SupabaseBaseClient],
    };
  }

  static forRootAsync(options: SupabaseModuleAsyncOptions): DynamicModule {
    return {
      module: SupabaseModule,
      global: true,
      providers: [
        {
          provide: SUPABASE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: SUPABASE_CLIENT,
          useFactory: (supabaseOptions: SupabaseOptionsCore): SupabaseClient => {
            return createClient(
              supabaseOptions.databaseUrl,
              supabaseOptions.databaseKey,
            );
          },
          inject: [SUPABASE_OPTIONS],
        },
        SupabaseBaseClient,
      ],
      exports: [SUPABASE_CLIENT, SupabaseBaseClient],
    };
  }
}
