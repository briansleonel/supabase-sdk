# NestJS Supabase SDK

Un SDK completo para trabajar con Supabase que funciona tanto en **NestJS** como en proyectos **standalone** (Express, TypeScript/JavaScript vanilla). Incluye cliente base, sistema de consultas avanzado con filtros, paginación y soporte para soft deletes.

## 📦 Instalación
```bash
npm install @contactship/supabase-sdk
```

### Dependencias requeridas
```bash
npm install @supabase/supabase-js lodash
```

### Dependencias opcionales (solo para NestJS)
```bash
# Para proyectos NestJS
npm install @nestjs/common @nestjs/core reflect-metadata rxjs

# Para documentación con Swagger (opcional)
npm install @nestjs/swagger class-validator class-transformer
```

## 🎯 Compatibilidad

Este SDK funciona en:
- ✅ **NestJS** - Con decoradores e inyección de dependencias
- ✅ **Express** - Con factory functions
- ✅ **TypeScript/JavaScript vanilla** - Sin frameworks
- ✅ **Node.js** - Cualquier entorno Node

## 🚀 Uso en NestJS

### 1. Variables de entorno

Crea un archivo `.env`:
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
```

### 2. Configurar el módulo

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
        tables: ['agents', 'campaigns', 'contacts'], // Tablas con soft delete
      }),
      inject: [ConfigService],
    }),
    SupabaseCriteriaModule, // Para consultas avanzadas
  ],
})
export class AppModule {}
```

### 3. Usar en servicios
```typescript
import { Injectable } from '@nestjs/common';
import { SupabaseBaseClient, SupabaseQueryService } from '@contactship/supabase-sdk';

interface User {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseClient: SupabaseBaseClient,
    private readonly queryService: SupabaseQueryService,
  ) {}

  // CRUD básico
  async createUser(userData: Partial<User>): Promise<User> {
    return await this.supabaseClient.create<User>('users', userData);
  }

  async getUserById(id: string): Promise<User> {
    return await this.supabaseClient.getById<User>('users', id);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return await this.supabaseClient.update<User>('users', id, data);
  }

  // Consultas avanzadas con paginación
  async searchUsers(query: QueryDto) {
    const criteria = new CriteriaDto(
      'users',
      '*',
      query.filters,
      query.orderBy,
      query.orderDirection,
      query.limit?.toString(),
      query.offset?.toString(),
    );

    return await this.queryService.matching<User>(criteria);
  }
}
```

## 🔧 Uso Standalone (Express, TypeScript vanilla)

### 1. Instalación y setup
```bash
npm install @contactship/supabase-sdk @supabase/supabase-js lodash
```

### 2. Crear instancia del SDK
```typescript
import { createSupabaseSDK } from '@contactship/supabase-sdk/standalone';

// Crear instancia del SDK
const supabase = createSupabaseSDK({
  databaseUrl: process.env.SUPABASE_URL!,
  databaseKey: process.env.SUPABASE_KEY!,
  tables: ['users', 'posts', 'comments'], // Tablas con soft delete
});

// El SDK expone:
// - supabase.baseClient: Cliente base para CRUD
// - supabase.queryService: Servicio de consultas avanzadas
// - supabase.converter: Conversor de queries
// - supabase.actions: Acciones auxiliares (filtros, paginación)
```

### 3. Ejemplo con Express
```typescript
import express from 'express';
import { createSupabaseSDK } from '@contactship/supabase-sdk/standalone';
import type { 
  CriteriaDto, 
  IFilterByPagination 
} from '@contactship/supabase-sdk/core';

const app = express();
app.use(express.json());

// Inicializar SDK
const supabase = createSupabaseSDK({
  databaseUrl: process.env.SUPABASE_URL!,
  databaseKey: process.env.SUPABASE_KEY!,
  tables: ['users'],
});

// CRUD básico
app.post('/users', async (req, res) => {
  try {
    const user = await supabase.baseClient.create('users', req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await supabase.baseClient.getById('users', req.params.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const user = await supabase.baseClient.update(
      'users',
      req.params.id,
      req.body
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consultas con filtros y paginación
app.get('/users', async (req, res) => {
  try {
    const { limit = 20, offset = 0, filters, orderBy, orderDirection } = req.query;

    // Importar CriteriaDto desde core
    const { CriteriaDto } = await import('@contactship/supabase-sdk/core');
    
    const criteria = new CriteriaDto(
      'users',
      '*',
      filters ? JSON.parse(filters as string) : undefined,
      orderBy as string,
      orderDirection as any,
      limit.toString(),
      offset.toString(),
    );

    const result = await supabase.queryService.matching(criteria);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Búsqueda avanzada
app.get('/users/search', async (req, res) => {
  try {
    const users = await supabase.baseClient.getByQuery('users', {
      role: 'admin',
      active: true,
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 4. Ejemplo con TypeScript puro
```typescript
import { createSupabaseSDK } from '@contactship/supabase-sdk/standalone';
import { CriteriaDto, FiltersDto, OperatorEnum } from '@contactship/supabase-sdk/core';

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

// Inicializar
const supabase = createSupabaseSDK({
  databaseUrl: process.env.SUPABASE_URL!,
  databaseKey: process.env.SUPABASE_KEY!,
});

// Crear usuario
async function createUser(userData: Partial<User>): Promise<User> {
  return await supabase.baseClient.create<User>('users', userData);
}

// Buscar usuarios mayores de 18
async function getAdultUsers() {
  const filters = [
    new FiltersDto('age', OperatorEnum.GREATER_THAN, 18),
    new FiltersDto('status', OperatorEnum.EQUAL, 'active'),
  ];

  const criteria = new CriteriaDto(
    'users',
    'id,name,email,age',
    JSON.stringify(filters),
    'created_at',
    'DESCENDENT',
    '50',
    '0',
  );

  return await supabase.queryService.matching<User>(criteria);
}

// Usar las actions auxiliares
async function buildPaginatedResponse(data: any, limit: number, offset: number) {
  return supabase.actions.buildPagination.execute(
    { data, total_rows: 100 },
    limit,
    offset,
  );
}

// Ejecutar
(async () => {
  const newUser = await createUser({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
  });
  console.log('Usuario creado:', newUser);

  const adults = await getAdultUsers();
  console.log('Usuarios adultos:', adults);
})();
```

## 📚 Métodos del Cliente Base

### `create<T>(table, data, schema?, columns?)`
Crea un nuevo registro.
```typescript
// NestJS
const user = await this.supabaseClient.create<User>('users', { name: 'John' });

// Standalone
const user = await supabase.baseClient.create<User>('users', { name: 'John' });
```

### `update<T>(table, id, data, relation?, columns?)`
Actualiza un registro existente.
```typescript
// NestJS
const user = await this.supabaseClient.update<User>('users', 'id-123', { name: 'Jane' });

// Standalone
const user = await supabase.baseClient.update<User>('users', 'id-123', { name: 'Jane' });
```

### `getById<T>(table, id, columns?)`
Obtiene un registro por ID.
```typescript
// NestJS
const user = await this.supabaseClient.getById<User>('users', 'id-123');

// Standalone
const user = await supabase.baseClient.getById<User>('users', 'id-123');
```

### `getByQuery<T>(table, query)`
Obtiene múltiples registros.
```typescript
// NestJS
const users = await this.supabaseClient.getByQuery<User[]>('users', { 
  role: 'admin' 
});

// Standalone
const users = await supabase.baseClient.getByQuery<User[]>('users', { 
  role: 'admin' 
});
```

### `getOneByQuery<T>(table, query, columns?)`
Obtiene un único registro.
```typescript
// NestJS
const user = await this.supabaseClient.getOneByQuery<User>('users', { 
  email: 'john@example.com' 
});

// Standalone
const user = await supabase.baseClient.getOneByQuery<User>('users', { 
  email: 'john@example.com' 
});
```

### `login(email, password)`
Autenticación de usuarios.
```typescript
// NestJS
const { data } = await this.supabaseClient.login(email, password);

// Standalone
const { data } = await supabase.baseClient.login(email, password);
```

### `rpc(functionName, params)`
Llamar funciones RPC de Supabase.
```typescript
// NestJS
const result = await this.supabaseClient.rpc('my_function', { param: 'value' });

// Standalone
const result = await supabase.baseClient.rpc('my_function', { param: 'value' });
```

## 🔍 Consultas Avanzadas

### En NestJS
```typescript
import { Injectable } from '@nestjs/common';
import {
  SupabaseQueryService,
  CriteriaDto,
  QueryDto,
  IFilterByPagination,
  IFilterById,
} from '@contactship/supabase-sdk';

@Injectable()
export class ProductService {
  constructor(private readonly queryService: SupabaseQueryService) {}

  async searchProducts(
    organizationId: string,
    query: QueryDto,
  ): Promise<IFilterByPagination<Product>> {
    const filterById: IFilterById = {
      field: 'organization_id',
      value: organizationId,
    };

    const criteria = new CriteriaDto(
      'products',
      '*',
      query.filters,
      query.orderBy || 'created_at',
      query.orderDirection || 'DESCENDENT',
      query.limit?.toString() || '20',
      query.offset?.toString() || '0',
      filterById,
    );

    return await this.queryService.matching<Product>(criteria);
  }
}
```

### En Standalone
```typescript
import { createSupabaseSDK } from '@contactship/supabase-sdk/standalone';
import { 
  CriteriaDto, 
  FiltersDto, 
  OperatorEnum 
} from '@contactship/supabase-sdk/core';

const supabase = createSupabaseSDK({
  databaseUrl: process.env.SUPABASE_URL!,
  databaseKey: process.env.SUPABASE_KEY!,
});

async function searchProducts(filters: any) {
  // Construir filtros
  const filtersArray = [
    new FiltersDto('status', OperatorEnum.EQUAL, 'active'),
    new FiltersDto('price', OperatorEnum.GREATER_THAN, 10),
  ];

  // Crear criterio
  const criteria = new CriteriaDto(
    'products',
    '*',
    JSON.stringify(filtersArray),
    'created_at',
    'DESCENDENT',
    '20',
    '0',
  );

  // Ejecutar consulta
  const result = await supabase.queryService.matching(criteria);
  
  return result;
}
```

## 🎯 Operadores Disponibles
```typescript
import { OperatorEnum } from '@contactship/supabase-sdk';

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

### Ejemplos de uso de filtros
```typescript
import { FiltersDto, OperatorEnum } from '@contactship/supabase-sdk/core';

// Filtro simple
const filter1 = new FiltersDto('status', OperatorEnum.EQUAL, 'active');

// Filtro con IN
const filter2 = new FiltersDto('role', OperatorEnum.IN, ['admin', 'editor']);

// Filtro con LIKE
const filter3 = new FiltersDto('name', OperatorEnum.ILIKE, '%john%');

// Filtro con IS NULL
const filter4 = new FiltersDto('deleted_at', OperatorEnum.IS, null);

// Filtro con rango de fechas
const filter5 = new FiltersDto('created_at', OperatorEnum.GTE, '2024-01-01');

// Combinar múltiples filtros
const filters = [filter1, filter2, filter3];
const criteria = new CriteriaDto(
  'users',
  '*',
  JSON.stringify(filters),
  'created_at',
  'DESCENDENT',
  '20',
  '0',
);
```

## 📊 Respuesta de Paginación
```typescript
interface IFilterByPagination<T> {
  data: T[];
  pagination: {
    page: number;
    total_rows: number;
    total_pages: number;
  };
}

// Ejemplo de respuesta
{
  "data": [
    {
      "id": "1",
      "name": "Product 1",
      "price": 29.99
    },
    {
      "id": "2",
      "name": "Product 2",
      "price": 39.99
    }
  ],
  "pagination": {
    "page": 1,
    "total_rows": 45,
    "total_pages": 3
  }
}
```

## 🗑️ Soft Deletes

El SDK soporta soft deletes automáticamente para las tablas configuradas.

### Configuración
```typescript
// NestJS
SupabaseModule.forRoot({
  databaseUrl: process.env.SUPABASE_URL,
  databaseKey: process.env.SUPABASE_KEY,
  tables: ['users', 'posts', 'comments'], // Tablas con soft delete
})

// Standalone
const supabase = createSupabaseSDK({
  databaseUrl: process.env.SUPABASE_URL!,
  databaseKey: process.env.SUPABASE_KEY!,
  tables: ['users', 'posts', 'comments'], // Tablas con soft delete
});
```

### Funcionamiento

Todas las consultas en las tablas configuradas automáticamente filtran registros donde `deleted_at IS NULL`:
```typescript
// Esta consulta automáticamente excluye registros eliminados
const users = await supabase.baseClient.getByQuery('users', { role: 'admin' });
// SQL generado: SELECT * FROM users WHERE role = 'admin' AND deleted_at IS NULL
```

## 🔐 Autenticación

### En NestJS
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
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

### En Standalone
```typescript
import { createSupabaseSDK } from '@contactship/supabase-sdk/standalone';

const supabase = createSupabaseSDK({
  databaseUrl: process.env.SUPABASE_URL!,
  databaseKey: process.env.SUPABASE_KEY!,
});

async function login(email: string, password: string) {
  const { data, error } = await supabase.baseClient.login(email, password);
  
  if (error) {
    throw new Error('Invalid credentials');
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: data.user,
  };
}
```

## 📖 Exports Disponibles

### Para NestJS
```typescript
// Módulos
import { 
  SupabaseModule, 
  SupabaseCriteriaModule 
} from '@contactship/supabase-sdk';

// Clientes y servicios
import {
  SupabaseBaseClient,
  SupabaseQueryService,
  ConvertToSupabaseQuery,
} from '@contactship/supabase-sdk';

// Actions
import {
  AddNewFilterAction,
  BuildPaginationAction,
} from '@contactship/supabase-sdk';

// DTOs
import {
  QueryDto,
  CriteriaDto,
  FiltersDto,
  OrderDto,
  PaginationDto,
} from '@contactship/supabase-sdk';

// Interfaces
import {
  IFilters,
  IFilterByPagination,
  IFilterById,
  SupabaseModuleOptions,
} from '@contactship/supabase-sdk';

// Enums
import {
  OperatorEnum,
  OrderDirectionEnum,
} from '@contactship/supabase-sdk';
```

### Para Standalone
```typescript
// Factory principal
import { createSupabaseSDK } from '@contactship/supabase-sdk/standalone';

// Clases core
import {
  SupabaseBaseClientCore,
  SupabaseQueryServiceCore,
  ConvertToSupabaseQueryCore,
  AddNewFilterActionCore,
  BuildPaginationActionCore,
} from '@contactship/supabase-sdk/core';

// DTOs
import {
  CriteriaDto,
  FiltersDto,
  OrderDto,
  PaginationDto,
} from '@contactship/supabase-sdk/core';

// Interfaces
import type {
  IFilters,
  IFilterByPagination,
  IRpcResponse,
  SupabaseOptionsCore,
} from '@contactship/supabase-sdk/core';

// Enums
import {
  OperatorEnum,
  OrderDirectionEnum,
} from '@contactship/supabase-sdk/core';
```

## 🎨 Uso con Swagger (Solo NestJS)

Si tienes `@nestjs/swagger` instalado, los DTOs incluyen decoradores automáticamente:
```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { QueryDto } from '@contactship/supabase-sdk';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(@Query() query: QueryDto) {
    return this.userService.findAll(query);
  }
}
```

## 🔧 Ejemplos de Requests HTTP

### Paginación básica
```bash
GET /products?limit=10&offset=0
```

### Con filtros
```bash
GET /products?limit=10&offset=0&filters=[{"field":"status","operator":"EQUAL","value":"active"}]
```

### Con ordenamiento
```bash
GET /products?limit=10&offset=0&orderBy=created_at&orderDirection=DESCENDENT
```

### Consulta completa
```bash
GET /products?limit=20&offset=0&filters=[{"field":"name","operator":"ILIKE","value":"%laptop%"},{"field":"price","operator":"LTE","value":1000}]&orderBy=price&orderDirection=ASCENDENT
```

## 🤝 Ejemplos Completos

### Repositorio NestJS
```typescript
import { Injectable } from '@nestjs/common';
import { SupabaseBaseClient } from '@contactship/supabase-sdk';

interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class UserRepository {
  constructor(private readonly supabaseClient: SupabaseBaseClient) {}

  async create(userData: Partial<User>): Promise<User> {
    return this.supabaseClient.create<User>('users', userData);
  }

  async findById(id: string): Promise<User> {
    return this.supabaseClient.getById<User>('users', id);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    return this.supabaseClient.update<User>('users', id, userData);
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.supabaseClient.getOneByQuery<User>('users', { email });
    } catch (error) {
      return null;
    }
  }
}
```

### Aplicación Express completa
```typescript
import express from 'express';
import { createSupabaseSDK } from '@contactship/supabase-sdk/standalone';
import { 
  CriteriaDto, 
  FiltersDto, 
  OperatorEnum 
} from '@contactship/supabase-sdk/core';

const app = express();
app.use(express.json());

const supabase = createSupabaseSDK({
  databaseUrl: process.env.SUPABASE_URL!,
  databaseKey: process.env.SUPABASE_KEY!,
  tables: ['users'],
});

// CRUD
app.post('/users', async (req, res) => {
  try {
    const user = await supabase.baseClient.create('users', req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await supabase.baseClient.getById('users', req.params.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
});

// Búsqueda con filtros
app.get('/users/search', async (req, res) => {
  try {
    const { name, email, minAge } = req.query;
    const filters = [];

    if (name) {
      filters.push(new FiltersDto('name', OperatorEnum.ILIKE, `%${name}%`));
    }
    if (email) {
      filters.push(new FiltersDto('email', OperatorEnum.EQUAL, email));
    }
    if (minAge) {
      filters.push(new FiltersDto('age', OperatorEnum.GTE, Number(minAge)));
    }

    const criteria = new CriteriaDto(
      'users',
      '*',
      JSON.stringify(filters),
      'created_at',
      'DESCENDENT',
      '20',
      '0',
    );

    const result = await supabase.queryService.matching(criteria);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## 📝 Notas Importantes

1. **Imports**: 
   - NestJS: `@contactship/supabase-sdk`
   - Standalone: `@contactship/supabase-sdk/standalone`
   - Core (tipos/clases): `@contactship/supabase-sdk/core`

2. **Soft Deletes**: Configura las tablas en las opciones del módulo/SDK.

3. **Filtros**: En NestJS se envían como JSON string en query params, en standalone los construyes con `FiltersDto`.

4. **Paginación**: Siempre proporciona `limit` junto con `offset`.

5. **TypeScript**: Todas las funciones están completamente tipadas para mejor DX.

## 🐛 Troubleshooting

### Error: "Cannot find module '@contactship/supabase-sdk/standalone'"

Asegúrate de tener la versión más reciente:
```bash
npm install @contactship/supabase-sdk@latest
```

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

// ✅ Correcto - Usa el enum
import { OperatorEnum } from '@contactship/supabase-sdk/core';
{ "operator": OperatorEnum.EQUAL }
```

### Imports no funcionan
```typescript
// ❌ Evita imports desde /dist
import { ... } from '@contactship/supabase-sdk/dist/core/...';

// ✅ Usa los exports configurados
import { ... } from '@contactship/supabase-sdk';
import { ... } from '@contactship/supabase-sdk/standalone';
import { ... } from '@contactship/supabase-sdk/core';
```
