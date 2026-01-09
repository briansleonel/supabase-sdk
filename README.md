# NestJS Supabase Module

Un módulo completo de NestJS para trabajar con Supabase, que incluye cliente base, sistema de consultas avanzado con filtros, paginación y soporte para soft deletes.

## 📦 Instalación

```bash
npm install @contactship/supabase-sdk
```

### Dependencias requeridas

```bash
npm install @supabase/supabase-js class-validator class-transformer lodash
```

### Dependencias opcionales

```bash
# Para documentación con Swagger (opcional)
npm install @nestjs/swagger
```

## 🚀 Configuración rápida

### 1. Variables de entorno

Crea un archivo `.env`:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
```

### 2. Configurar el módulo en tu App

#### Opción A: Configuración síncrona

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule, SupabaseCriteriaModule } from '@contactship/supabase-sdk';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule.forRoot({
      databaseUrl: process.env.SUPABASE_URL,
      databaseKey: process.env.SUPABASE_KEY,
      tables: ['agents', 'campaigns', 'contacts'], // Tablas con soft delete
    }),
    SupabaseCriteriaModule, // Para consultas avanzadas
  ],
})
export class AppModule {}
```

#### Opción B: Configuración asíncrona (Recomendada)

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseModule, SupabaseCriteriaModule } from '@contactship/supabase-sdk';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        databaseUrl: configService.get<string>('SUPABASE_URL'),
        databaseKey: configService.get<string>('SUPABASE_KEY'),
        tables: ['agents', 'campaigns', 'contacts'],  // Tablas con soft delete
      }),
      inject: [ConfigService],
    }),
    SupabaseCriteriaModule, // Para consultas avanzadas
  ],
})
export class AppModule {}
```

## 📚 Uso básico

### Cliente Base de Supabase

El `SupabaseBaseClient` proporciona métodos CRUD básicos.

```typescript
import { Injectable } from '@nestjs/common';
import { SupabaseBaseClient } from '@contactship/supabase-sdk';

interface User {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

@Injectable()
export class UserService {
  constructor(private readonly supabaseClient: SupabaseBaseClient) {}

  // Crear un registro
  async createUser(userData: Partial<User>): Promise<User> {
    return await this.supabaseClient.create<User>('users', userData);
  }

  // Obtener por ID
  async getUserById(id: string): Promise<User> {
    return await this.supabaseClient.getById<User>('users', id);
  }

  // Actualizar
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return await this.supabaseClient.update<User>('users', id, data);
  }

  // Buscar por query
  async getUserByEmail(email: string): Promise<User> {
    return await this.supabaseClient.getOneByQuery<User>(
      'users',
      { email },
    );
  }

  // Obtener múltiples registros
  async getUsersByRole(role: string): Promise<User[]> {
    return await this.supabaseClient.getByQuery<User[]>(
      'users',
      { role },
    );
  }

  // Autenticación
  async login(email: string, password: string) {
    return await this.supabaseClient.login(email, password);
  }

  // Llamar a una función RPC
  async getCustomData(params: any) {
    return await this.supabaseClient.rpc('my_custom_function', params);
  }
}
```

### Métodos del SupabaseBaseClient

#### `create<T>(table, data, schema?, columns?)`
Crea un nuevo registro en la tabla especificada.

```typescript
const user = await this.supabaseClient.create<User>(
  'users',
  { name: 'John', email: 'john@example.com' }
);
```

#### `update<T>(table, id, data, relation?, columns?)`
Actualiza un registro existente.

```typescript
const user = await this.supabaseClient.update<User>(
  'users',
  'user-id-123',
  { name: 'Jane' }
);
```

#### `getById<T>(table, id, columns?)`
Obtiene un registro por su ID.

```typescript
const user = await this.supabaseClient.getById<User>('users', 'user-id-123');
```

#### `getByQuery<T>(table, query)`
Obtiene múltiples registros que coincidan con el query.

```typescript
const users = await this.supabaseClient.getByQuery<User[]>(
  'users',
  { role: 'admin', active: true }
);
```

#### `getOneByQuery<T>(table, query, columns?)`
Obtiene un único registro que coincida con el query.

```typescript
const user = await this.supabaseClient.getOneByQuery<User>(
  'users',
  { email: 'john@example.com' }
);
```

## 🔍 Consultas avanzadas con paginación

El `SupabaseQueryService` permite realizar consultas complejas con filtros, ordenamiento y paginación.

### Configuración en el Controller

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QueryDto, IFilterByPagination } from '@contactship/supabase-sdk';
import { CallTagService } from './call-tag.service';

@ApiTags('Call Tags')
@Controller('call-tags')
export class CallTagController {
  constructor(private readonly callTagService: CallTagService) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all call tags with filters and pagination' })
  async getAll(
    @Query('organization_id') organizationId: string,
    @Query() query: QueryDto,
  ): Promise<IFilterByPagination<CallTag>> {
    return this.callTagService.matching(organizationId, query);
  }
}
```

### Implementación en el Service

```typescript
import { Injectable } from '@nestjs/common';
import {
  SupabaseQueryService,
  CriteriaDto,
  IFilterByPagination,
  IFilterById,
  QueryDto,
} from '@contactship/supabase-sdk';

interface CallTag {
  id: string;
  name: string;
  organization_id: string;
  created_at: Date;
}

@Injectable()
export class CallTagService {
  constructor(
    private readonly supabaseQueryService: SupabaseQueryService,
  ) {}

  async matching(
    organizationId: string,
    query: QueryDto,
  ): Promise<IFilterByPagination<CallTag>> {
    // Filtro obligatorio por organización
    const filterById: IFilterById = {
      field: 'organization_id',
      value: organizationId,
    };

    // Construir el criterio
    const criteria = new CriteriaDto(
      'call_tags',              // tabla
      '*',                      // columnas a seleccionar
      query.filters,            // filtros adicionales
      query.orderBy,            // campo de ordenamiento
      query.orderDirection,     // dirección (ASC/DESC)
      query.limit?.toString(),  // límite de registros
      query.offset?.toString(), // offset para paginación
      filterById,               // filtro adicional obligatorio
    );

    return await this.supabaseQueryService.matching<CallTag>(criteria);
  }
}
```

### Ejemplos de requests

#### 1. Paginación básica

```bash
GET /call-tags?organization_id=org-123&limit=10&offset=0
```

#### 2. Con filtros

```bash
GET /call-tags?organization_id=org-123&limit=10&offset=0&filters=[{"field":"status","operator":"EQUAL","value":"active"}]
```

#### 3. Con ordenamiento

```bash
GET /call-tags?organization_id=org-123&limit=10&offset=0&orderBy=created_at&orderDirection=DESCENDENT
```

#### 4. Consulta completa

```bash
GET /call-tags?organization_id=org-123&limit=20&offset=0&filters=[{"field":"name","operator":"LIKE","value":"%urgent%"},{"field":"status","operator":"IN","value":["active","pending"]}]&orderBy=created_at&orderDirection=DESCENDENT
```

## 🎯 Operadores disponibles

```typescript
import { OperatorEnum } from '@tu-usuario/nestjs-supabase-module';

// Operadores soportados:
OperatorEnum.EQUAL           // eq - Igual a
OperatorEnum.NOT_EQUAL       // neq - Diferente de
OperatorEnum.GREATER_THAN    // gt - Mayor que
OperatorEnum.LESS_THAN       // lt - Menor que
OperatorEnum.GTE             // gte - Mayor o igual que
OperatorEnum.LTE             // lte - Menor o igual que
OperatorEnum.LIKE            // like - Similar a (búsqueda de texto)
OperatorEnum.ILIKE           // ilike - Similar a (case insensitive)
OperatorEnum.IN              // in - Dentro de un array
OperatorEnum.IS              // is - Es (null, true, false)
OperatorEnum.ARRAY_CONTAINS  // cs - Array contiene
OperatorEnum.ARRAY_INTERSECTS // && - Array intersecta
```

### Ejemplos de filtros

```json
// Filtro simple
[
  {
    "field": "status",
    "operator": "EQUAL",
    "value": "active"
  }
]

// Múltiples filtros
[
  {
    "field": "status",
    "operator": "IN",
    "value": ["active", "pending"]
  },
  {
    "field": "created_at",
    "operator": "GTE",
    "value": "2024-01-01"
  },
  {
    "field": "name",
    "operator": "ILIKE",
    "value": "%search%"
  }
]

// Filtro con null
[
  {
    "field": "deleted_at",
    "operator": "IS",
    "value": null
  }
]
```

## 📊 Respuesta de paginación

Las consultas con `SupabaseQueryService` devuelven un objeto `IFilterByPagination`:

```typescript
{
  "data": [
    {
      "id": "1",
      "name": "Tag 1",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "2",
      "name": "Tag 2",
      "status": "active",
      "created_at": "2024-01-16T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total_rows": 45,
    "total_pages": 5
  }
}
```

## 🛠️ DTOs disponibles

### QueryDto
Para recibir parámetros de consulta en tus endpoints.

```typescript
import { QueryDto } from '@contactship/supabase-sdk';

@Get()
async findAll(@Query() query: QueryDto) {
  // query.limit
  // query.offset
  // query.filters
  // query.orderBy
  // query.orderDirection
}
```

### CriteriaDto
Para construir consultas programáticamente.

```typescript
import { CriteriaDto, IFilterById } from '@contactship/supabase-sdk';

const filterById: IFilterById = {
  field: 'organization_id',
  value: 'org-123',
};

const criteria = new CriteriaDto(
  'users',                  // tabla
  'id,name,email',         // columnas
  query.filters,           // filtros JSON
  'created_at',            // orderBy
  'DESCENDENT',            // orderDirection
  '20',                    // limit
  '0',                     // offset
  filterById,              // filtro adicional
);
```

### FiltersDto
Para crear filtros manualmente.

```typescript
import { FiltersDto, OperatorEnum } from '@contactship/supabase-sdk';

const filter = new FiltersDto('status', 'EQUAL', 'active');
// O con el enum
const filter2 = new FiltersDto('age', OperatorEnum.GREATER_THAN, 18);
```

## 🗑️ Soft Deletes

El módulo soporta soft deletes automáticamente para las tablas configuradas.

### Configuración

```typescript
SupabaseModule.forRoot({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  tables: ['users', 'posts', 'comments'], // Tablas con soft delete
})
```

### Funcionamiento

Todas las consultas en las tablas configuradas automáticamente filtrarán registros donde `deleted_at IS NULL`:

```typescript
// Esta consulta automáticamente excluye registros eliminados
const users = await this.supabaseClient.getByQuery<User[]>('users', { 
  role: 'admin' 
});
// SQL generado: SELECT * FROM users WHERE role = 'admin' AND deleted_at IS NULL
```

## 🔐 Autenticación

```typescript
import { SupabaseBaseClient } from '@contactship/supabase-sdk';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseClient: SupabaseBaseClient) {}

  async login(email: string, password: string) {
    const { data, error } = await this.supabaseClient.login(email, password);
    
    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    };
  }
}
```

## 🎨 Uso con Swagger (Opcional)

Si tienes `@nestjs/swagger` instalado, los DTOs incluyen decoradores automáticamente:

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { QueryDto } from '@contactship/supabase-sdk';

@ApiTags('Users')
@Controller('users')
export class UserController {
  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(@Query() query: QueryDto) {
    return this.userService.findAll(query);
  }
}
```

## 🔧 Uso avanzado

### Consultas personalizadas con RPC

```typescript
async getCustomReport(filters: any) {
  const data = await this.supabaseClient.rpc(
    'get_sales_report',
    {
      start_date: filters.startDate,
      end_date: filters.endDate,
      region: filters.region,
    }
  );
  return data;
}
```

### Selección de columnas específicas

```typescript
// Solo columnas específicas
const user = await this.supabaseClient.getById<User>(
  'users',
  'user-123',
  'id,name,email'
);

// Con relaciones (joins)
const posts = await this.supabaseClient.getByQuery(
  'posts',
  { user_id: 'user-123' },
  'id,title,author:users(name,email)'
);
```

### Trabajar con schemas diferentes

```typescript
// Usar un schema personalizado
const data = await this.supabaseClient.create(
  'companies',
  { name: 'Acme Corp' },
  'custom_schema',  // schema
  '*'               // columns
);
```

## 📖 Interfaces exportadas

```typescript
import {
  IFilters,
  IOrder,
  IPagination,
  IFilterByPagination,
  IFilterById,
  SupabaseModuleOptions,
} from '@contactship/supabase-sdk';
```

### IFilterByPagination
```typescript
interface IFilterByPagination<T> {
  data: T[];
  pagination: {
    page: number;
    total_rows: number;
    total_pages: number;
  };
}
```

### IFilters
```typescript
interface IFilters {
  field: string;
  operator: OperatorEnum;
  value: string | number | string[] | number[] | Date | null;
}
```

## 🤝 Ejemplos completos

### Repositorio básico

```typescript
import { Injectable } from '@nestjs/common';
import { SupabaseBaseClient } from '@contactship/supabase-sdk';

@Injectable()
export class UserRepository {
  constructor(private readonly supabaseClient: SupabaseBaseClient) {}

  async create(userData: CreateUserDto): Promise<User> {
    return this.supabaseClient.create<User>('users', userData);
  }

  async findById(id: string): Promise<User> {
    return this.supabaseClient.getById<User>('users', id);
  }

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    return this.supabaseClient.update<User>('users', id, userData);
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.supabaseClient.getOneByQuery<User>(
        'users',
        { email }
      );
    } catch (error) {
      return null;
    }
  }
}
```

### Servicio con búsqueda avanzada

```typescript
import { Injectable } from '@nestjs/common';
import {
  SupabaseQueryService,
  CriteriaDto,
  QueryDto,
  IFilterByPagination,
} from '@contactship/supabase-sdk';

@Injectable()
export class ProductService {
  constructor(
    private readonly supabaseQueryService: SupabaseQueryService,
  ) {}

  async searchProducts(query: QueryDto): Promise<IFilterByPagination<Product>> {
    const criteria = new CriteriaDto(
      'products',
      'id,name,price,category,stock',
      query.filters,
      query.orderBy || 'created_at',
      query.orderDirection || 'DESCENDENT',
      query.limit?.toString() || '20',
      query.offset?.toString() || '0',
    );

    return this.supabaseQueryService.matching<Product>(criteria);
  }

  async getProductsByCategory(
    category: string,
    query: QueryDto,
  ): Promise<IFilterByPagination<Product>> {
    const criteria = new CriteriaDto(
      'products',
      '*',
      query.filters,
      query.orderBy,
      query.orderDirection,
      query.limit?.toString(),
      query.offset?.toString(),
      { field: 'category', value: category },
    );

    return this.supabaseQueryService.matching<Product>(criteria);
  }
}
```

## 📝 Notas importantes

1. **Soft Deletes**: Asegúrate de configurar las tablas que usan soft delete en las opciones del módulo.
2. **Filtros**: Los filtros deben enviarse como JSON string en los query parameters.
3. **Paginación**: Si usas `limit`, también debes proporcionar `offset`.
4. **Operadores**: Usa los operadores del enum para evitar errores de tipado.

## 🐛 Troubleshooting

### Error: "Offset provided without a limit"
```typescript
// ❌ Incorrecto
?offset=10

// ✅ Correcto
?limit=20&offset=10
```

### Error: "Invalid operator"
```typescript
// ❌ Incorrecto
{ "operator": "equals" }

// ✅ Correcto
{ "operator": "EQUAL" }
// O usa el enum
import { OperatorEnum } from '@contactship/supabase-sdk';
{ "operator": OperatorEnum.EQUAL }
```
