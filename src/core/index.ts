// core/index.ts
// Interfaces
export * from './criteria/domain/interfaces/between-filter.interface';
export * from './criteria/domain/interfaces/filter-by-id.interface';
export * from './criteria/domain/interfaces/filter-by-pagination';
export * from './criteria/domain/interfaces/filters.interface';
export * from './criteria/domain/interfaces/order.interface';
export * from './criteria/domain/interfaces/pagination-data.interface';
//export * from './criteria/domain/interfaces/pagination-filter.interface';
export * from './criteria/domain/interfaces/pagination.interface';
export * from './criteria/domain/interfaces/rpc-response.interface';
export * from './criteria/domain/interfaces/supabase-options-core.interface';

// Actions
export * from './criteria/application/actions/add-new-filter.action';
export * from './criteria/application/actions/build-pagination.action';

// Converters
export * from './criteria/infrastrcuture/converters/convert-to-supabase-query.converter';

// Clients
export * from './client/supabase-base.client';

// Services 
export * from './criteria/application/services/supabase-query.service';

// DTOs
export * from './criteria/domain/dto/criteria.dto';
export * from './criteria/domain/dto/filters.dto';
export * from './criteria/domain/dto/order.dto';
export * from './criteria/domain/dto/pagination.dto';
export * from './criteria/domain/dto/query.dto';

// Enums
export * from './criteria/domain/enums/operator.enum';
export * from './criteria/domain/enums/order-direction.enum';
