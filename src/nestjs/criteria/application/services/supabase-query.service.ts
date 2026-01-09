import { Injectable } from '@nestjs/common';
import { ConvertToSupabaseQuery } from '../../infrastructure/converters/convert-to-supabase-query.convert';
import { SupabaseQueryServiceCore } from 'src/core';
import { SupabaseBaseClient } from 'src/nestjs/clients/supabase-base-client';

@Injectable()
export class SupabaseQueryService extends SupabaseQueryServiceCore {
  constructor(
    convertToSupabaseQuery: ConvertToSupabaseQuery,
    supabaseClient: SupabaseBaseClient,
  ) {
    super(convertToSupabaseQuery, supabaseClient);
  }
}
