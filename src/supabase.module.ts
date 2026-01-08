import { DynamicModule, Module } from '@nestjs/common';
import { SupabaseModuleOptions } from './common/interfaces/db-module-options.interface';
import { SUPABASE_CLIENT, SUPABASE_OPTIONS } from './clients/symbols';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseClient } from './clients/supabase-base-client';
import { SupabaseModuleAsyncOptions } from './common/interfaces/db-module-async-options.interface';

@Module({})
export class SupabaseModule {
  static forRoot(options: SupabaseModuleOptions): DynamicModule {
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
          provide: 'SUPABASE_OPTIONS',
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
          useFactory: (supabaseOptions: SupabaseModuleOptions): SupabaseClient => {
            return createClient(
              supabaseOptions.databaseUrl,
              supabaseOptions.databaseKey,
            );
          },
          inject: ['SUPABASE_OPTIONS'],
        },
        SupabaseBaseClient,
      ],
      exports: [SUPABASE_CLIENT, SupabaseBaseClient],
    };
  }
}
