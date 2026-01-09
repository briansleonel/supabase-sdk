// nestjs/index.ts
// Módulos
export * from './supabase.module';
export * from './criteria/supabase-criteria.module';

// Clients
export * from './clients/supabase-base-client';

// Actions
export * from './criteria/application/actions/add-new-filter.action';
export * from './criteria/application/actions/build-pagination.action';

// Converters
export * from './criteria/infrastructure/converters/convert-to-supabase-query.convert';

// Interfaces


// Symbols
export * from './symbols';

// Re-exportar interfaces core para conveniencia
export * from '../core/criteria/domain/interfaces/between-filter.interface';
export * from '../core/criteria/domain/interfaces/filter-by-id.interface';
export * from '../core/criteria/domain/interfaces/filter-by-pagination';
export * from '../core/criteria/domain/interfaces/filters.interface';
export * from '../core/criteria/domain/interfaces/order.interface';
export * from '../core/criteria/domain/interfaces/pagination-data.interface';
//export * from '../core/criteria/domain/interfaces/pagination-filter.interface';
export * from '../core/criteria/domain/interfaces/pagination.interface';
export * from '../core/criteria/domain/interfaces/rpc-response.interface';
export * from '../core/criteria/domain/interfaces/supabase-options-core.interface';

// DTOs
export * from '../core/criteria/domain/dto/criteria.dto';
export * from '../core/criteria/domain/dto/filters.dto';
export * from '../core/criteria/domain/dto/order.dto';
export * from '../core/criteria/domain/dto/pagination.dto';
export * from '../core/criteria/domain/dto/query.dto';

// Enums
export * from '../core/criteria/domain/enums/operator.enum';
export * from '../core/criteria/domain/enums/order-direction.enum';