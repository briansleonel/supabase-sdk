import { SupabaseClient } from '@supabase/supabase-js';
import {
  AddNewFilterActionCore,
  BuildPaginationActionCore,
  ConvertToSupabaseQueryCore,
  SupabaseBaseClientCore,
  SupabaseQueryServiceCore,
} from '../../core';

export interface SupabaseSDK {
  baseClient: SupabaseBaseClientCore;
  queryService: SupabaseQueryServiceCore;
  converter: ConvertToSupabaseQueryCore;
  actions: {
    addNewFilter: AddNewFilterActionCore;
    buildPagination: BuildPaginationActionCore;
  };
  rawClient: SupabaseClient;
}
