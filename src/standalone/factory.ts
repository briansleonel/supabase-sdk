import { createClient } from '@supabase/supabase-js';
import { SupabaseOptionsCore } from '../core/criteria/domain/interfaces/supabase-options-core.interface';
import { SupabaseBaseClientCore } from '../core/client/supabase-base.client';
import { SupabaseSDK } from './interfaces/supabase-sdk.interface';
import {
  AddNewFilterActionCore,
  BuildPaginationActionCore,
  ConvertToSupabaseQueryCore,
  SupabaseQueryServiceCore,
} from 'src/core';

export function createSupabaseSDK(options: SupabaseOptionsCore): SupabaseSDK {
  const client = createClient(options.databaseUrl, options.databaseKey);

  const baseClient = new SupabaseBaseClientCore(client, options);
  const converter = new ConvertToSupabaseQueryCore(client);
  const queryService = new SupabaseQueryServiceCore(converter, baseClient);

  const addNewFilter = new AddNewFilterActionCore();
  const buildPagination = new BuildPaginationActionCore();

  return {
    baseClient,
    queryService,
    converter,
    actions: {
      addNewFilter,
      buildPagination,
    },
    rawClient: client,
  };
}
