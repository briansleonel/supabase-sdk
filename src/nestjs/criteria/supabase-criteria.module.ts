import { Module } from '@nestjs/common';
import { ConvertToSupabaseQuery } from './infrastructure/converters/convert-to-supabase-query.convert';
import { SupabaseQueryService } from './application/services/supabase-query.service';
import { AddNewFilterAction } from './application/actions/add-new-filter.action';
import { BuildPaginationAction } from './application/actions/build-pagination.action';

@Module({
  imports: [],
  providers: [
    ConvertToSupabaseQuery,
    SupabaseQueryService,
    AddNewFilterAction,
    BuildPaginationAction,
  ],
  exports: [
    ConvertToSupabaseQuery,
    SupabaseQueryService,
    AddNewFilterAction,
    BuildPaginationAction,
  ],
})
export class SupabaseCriteriaModule {}
