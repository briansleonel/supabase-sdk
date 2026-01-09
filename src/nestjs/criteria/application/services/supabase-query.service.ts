import { Injectable } from '@nestjs/common';
import { ConvertToSupabaseQuery } from '../../infrastructure/converters/convert-to-supabase-query.convert';
import { SupabaseQueryServiceCore } from '../../../../core';
import { SupabaseBaseClient } from '../../../clients/supabase-base-client';

@Injectable()
export class SupabaseQueryService extends SupabaseQueryServiceCore {
  constructor(
    convertToSupabaseQuery: ConvertToSupabaseQuery,
    supabaseClient: SupabaseBaseClient,
  ) {
    super(convertToSupabaseQuery, supabaseClient);
  }
}
