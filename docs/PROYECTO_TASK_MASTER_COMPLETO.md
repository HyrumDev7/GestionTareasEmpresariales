# 📋 TaskMaster Pro - Documentación Completa del Proyecto

> Este documento contiene toda la documentación del proyecto TaskMaster Pro, incluyendo arquitectura, funcionalidades implementadas, guías de uso y más.

---

## 📑 Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Funcionalidades Implementadas](#funcionalidades-implementadas)
4. [Guía de Instalación](#guía-de-instalación)
5. [API Endpoints](#api-endpoints)
6. [Modelo de Datos](#modelo-de-datos)
7. [Seguridad](#seguridad)
8. [Tecnologías Utilizadas](#tecnologías-utilizadas)
9. [Mejoras Futuras](#mejoras-futuras)

---

## Descripción del Proyecto

### ¿Qué es TaskMaster Pro?

TaskMaster Pro es una API REST empresarial construida con Node.js, TypeScript y PostgreSQL que permite a los usuarios gestionar proyectos y tareas con diferentes niveles de permisos. El sistema incluye autenticación JWT, autorización por roles, integración con OpenAI para generación inteligente de tareas, y múltiples funcionalidades avanzadas.

### Características Principales

- 🔐 **Autenticación JWT** con access y refresh tokens
- 👥 **Sistema de roles** (ADMIN, MANAGER, USER)
- 📁 **Gestión de proyectos** con CRUD completo
- ✅ **Gestión de tareas** con asignación y prioridades
- 🤖 **Integración con OpenAI** para generación inteligente de tareas
- 🔒 **Seguridad** (bcrypt, helmet, CORS, rate limiting)
- ✅ **Validación de datos** con Zod
- 🗄️ **Base de datos** PostgreSQL con Prisma ORM
- 🐳 **Docker** para entorno de desarrollo
- 📄 **Documentación Swagger/OpenAPI** interactiva

---

## Arquitectura del Sistema

### Visión General

TaskMaster Pro sigue un patrón de **arquitectura en capas** con separación clara de responsabilidades.

### Capas de Arquitectura

```
┌─────────────────────────────────────────┐
│           HTTP Request                  │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         MIDDLEWARE LAYER                │
│  - Authentication (JWT)                 │
│  - Authorization (Roles)                │
│  - Validation (Zod)                     │
│  - Error Handling                       │
│  - Rate Limiting                        │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         CONTROLLER LAYER                │
│  - Request parsing                      │
│  - Response formatting                  │
│  - HTTP status codes                    │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          SERVICE LAYER                  │
│  - Business logic                       │
│  - Data processing                      │
│  - Authorization rules                  │
│  - AI Integration (OpenAI)              │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          DATA LAYER (Prisma)            │
│  - Database queries                     │
│  - Transactions                         │
│  - Relationships                        │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│        PostgreSQL Database              │
└─────────────────────────────────────────┘
```

### Flujo de Autenticación

1. Usuario envía credenciales (email + password)
2. Backend verifica con bcrypt
3. Genera tokens JWT (access + refresh)
4. Cliente almacena tokens
5. Cliente envía token en header Authorization
6. Middleware verifica firma JWT
7. Extrae información del usuario del token
8. Adjunta a objeto request

### Flujo de Autorización

1. Request llega con JWT válido
2. Extrae rol del usuario del token
3. Verifica permisos de la ruta
4. Para acciones específicas de recursos:
   - Verifica propiedad (userId === ownerId)
   - O verifica rol ADMIN
5. Permite o deniega request

### Diseño de Base de Datos

#### Relaciones entre Entidades

```
User (1) ──── (N) Project
  │
  │
  └──── (N) Task

Project (1) ──── (N) Task
```

#### Decisiones de Diseño Clave

- **UUID como Primary Keys**: Mejor para sistemas distribuidos
- **Cascade Deletes**: Eliminar proyecto → eliminar todas las tareas
- **Set Null on User Delete**: Mantener tareas pero desasignar usuario
- **Índices**: En foreign keys y campos consultados frecuentemente
- **Enums**: Para status y priority (integridad de datos)

---

## Funcionalidades Implementadas

> **Nota**: Esta sección contiene la documentación detallada de todas las funcionalidades implementadas. Para más detalles, ver [FUNCIONALIDADES.md](FUNCIONALIDADES.md)

### 1. Endpoint de Refresh Token

#### ¿Qué es?

El endpoint de refresh token permite renovar el access token sin necesidad de volver a hacer login, mejorando la experiencia del usuario y manteniendo la seguridad.

#### ¿Cómo funciona?

**Paso 1: Login Inicial**
```json
POST /api/v1/auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}

// Respuesta:
{
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Características de los tokens:**
- **Access Token**: Expira en 7 días (configurable)
- **Refresh Token**: Expira en 30 días (configurable)

**Paso 2: Renovación del Token**
```json
POST /api/v1/auth/refresh-token
{
  "refreshToken": "tu-refresh-token-aqui"
}

// Respuesta:
{
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "nuevo-access-token",
    "refreshToken": "nuevo-refresh-token"
  }
}
```

#### Beneficios

✅ Mejor experiencia de usuario  
✅ Mayor seguridad  
✅ Sesiones más largas sin comprometer seguridad

---

### 2. Paginación en Listados

#### ¿Qué es?

La paginación divide los resultados en páginas para evitar cargar todos los registros de una vez, mejorando el rendimiento y la experiencia del usuario.

#### Parámetros de Query

- **`page`**: Número de página (default: 1)
- **`limit`**: Cantidad de resultados por página (default: 10, máximo: 100)

#### Ejemplo de Uso

```javascript
GET /api/v1/projects?page=1&limit=10

// Respuesta:
{
  "message": "Projects retrieved successfully",
  "data": [ /* ... 10 proyectos ... */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Beneficios

✅ Mejor rendimiento  
✅ Menor uso de memoria  
✅ Mejor experiencia en frontend  
✅ Escalabilidad

---

### 3. Filtros Avanzados

#### Filtros Disponibles en Proyectos

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `status` | string | Filtrar por estado (ACTIVE, COMPLETED, ARCHIVED, ON_HOLD) |
| `search` | string | Buscar en nombre o descripción |

#### Filtros Disponibles en Tareas

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `projectId` | UUID | Filtrar por proyecto específico |
| `status` | string | Filtrar por estado (TODO, IN_PROGRESS, DONE, etc.) |
| `priority` | string | Filtrar por prioridad (LOW, MEDIUM, HIGH, URGENT) |
| `assignedToId` | UUID | Filtrar por usuario asignado |
| `search` | string | Buscar en título o descripción |
| `dueDateFrom` | date | Tareas con fecha desde... |
| `dueDateTo` | date | Tareas con fecha hasta... |

#### Ejemplos de Uso

```javascript
// Buscar proyectos activos que contengan "web"
GET /api/v1/projects?status=ACTIVE&search=web&page=1&limit=10

// Buscar tareas urgentes asignadas a un usuario
GET /api/v1/tasks?priority=URGENT&assignedToId=456&page=1&limit=20

// Filtrar tareas vencidas
GET /api/v1/tasks?dueDateTo=2024-01-12&status=TODO
```

---

### 4. Estadísticas Mejoradas de Proyectos

#### Información Proporcionada

**Totales:**
- `totalTasks`: Total de tareas
- `completedTasks`: Tareas completadas
- `inProgressTasks`: Tareas en progreso
- `overdueTasks`: Tareas vencidas
- `urgentTasks`: Tareas urgentes pendientes

**Porcentajes:**
- `completionPercentage`: Porcentaje de completitud (0-100)

**Desgloses:**
- `byStatus`: Cantidad por estado
- `byPriority`: Cantidad por prioridad

#### Ejemplo de Respuesta

```json
{
  "message": "Project stats retrieved successfully",
  "data": {
    "totalTasks": 18,
    "completedTasks": 10,
    "inProgressTasks": 3,
    "overdueTasks": 2,
    "urgentTasks": 3,
    "completionPercentage": 55,
    "byStatus": {
      "TODO": 5,
      "IN_PROGRESS": 3,
      "DONE": 10
    },
    "byPriority": {
      "LOW": 2,
      "MEDIUM": 8,
      "HIGH": 5,
      "URGENT": 3
    }
  }
}
```

---

### 5. Rate Limiting (Límite de Peticiones)

#### Tipos Implementados

1. **Rate Limiting General**
   - 100 peticiones por 15 minutos
   - Aplicado a todas las rutas

2. **Rate Limiting de Autenticación**
   - 5 intentos por 15 minutos
   - Aplicado a login/register/refresh-token

3. **Rate Limiting de Creación**
   - 10 creaciones por minuto
   - Aplicado a POST de proyectos/tareas

#### Beneficios

✅ Protección contra DDoS  
✅ Protección contra fuerza bruta  
✅ Prevención de spam  
✅ Uso equitativo de recursos

---

### 6. Documentación Swagger/OpenAPI

#### ¿Cómo Acceder?

1. Inicia el servidor: `npm run dev`
2. Abre: `http://localhost:3000/api-docs`
3. Explora y prueba endpoints directamente

#### Características

- ✅ Todos los endpoints documentados
- ✅ Esquemas de datos definidos
- ✅ Ejemplos de uso
- ✅ Pruebas interactivas
- ✅ Autenticación JWT integrada

---

### 7. Integración con OpenAI

#### Endpoints Disponibles

1. **Generar Tarea desde Texto Natural**
   ```
   POST /api/v1/ai/generate-task
   ```

2. **Sugerir Tareas para Proyecto**
   ```
   POST /api/v1/ai/suggest-tasks
   ```

3. **Analizar Texto**
   ```
   POST /api/v1/ai/analyze
   ```

#### Características

- ✅ Reconocimiento automático de prioridades
- ✅ Interpretación de fechas relativas
- ✅ Estimación de tiempo
- ✅ Validación robusta de respuestas
- ✅ Manejo completo de errores

---

## Guía de Instalación

### Prerequisitos

- Node.js 18+
- Docker Desktop
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/taskmaster-pro.git
   cd taskmaster-pro
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus valores
   ```

   **Variables importantes:**
   - `OPENAI_API_KEY`: Obtén tu API key de [OpenAI Platform](https://platform.openai.com/api-keys)
   - `DATABASE_URL`: URL de conexión a PostgreSQL
   - `JWT_SECRET` y `JWT_REFRESH_SECRET`: Claves secretas (mínimo 32 caracteres)

4. **Levantar PostgreSQL con Docker**
   ```bash
   docker-compose up -d
   ```

5. **Ejecutar migraciones**
   ```bash
   npx prisma migrate dev
   ```

6. **Iniciar servidor**
   ```bash
   npm run dev
   ```

El servidor estará disponible en: `http://localhost:3000`

**Documentación interactiva:** `http://localhost:3000/api-docs`

---

## API Endpoints

### Autenticación

| Método | Endpoint                     | Descripción          | Auth |
| ------ | ---------------------------- | -------------------- | ---- |
| POST   | `/api/v1/auth/register`      | Registrar usuario    | ❌   |
| POST   | `/api/v1/auth/login`         | Iniciar sesión       | ❌   |
| POST   | `/api/v1/auth/refresh-token` | Renovar access token | ❌   |
| GET    | `/api/v1/auth/me`            | Perfil del usuario   | ✅   |

### Projects

| Método | Endpoint                     | Descripción         | Auth | Query Params                        |
| ------ | ---------------------------- | ------------------- | ---- | ----------------------------------- |
| POST   | `/api/v1/projects`           | Crear proyecto      | ✅   | -                                   |
| GET    | `/api/v1/projects`           | Listar proyectos    | ✅   | `page`, `limit`, `status`, `search` |
| GET    | `/api/v1/projects/:id`       | Ver proyecto        | ✅   | -                                   |
| PUT    | `/api/v1/projects/:id`       | Actualizar proyecto | ✅   | -                                   |
| DELETE | `/api/v1/projects/:id`       | Eliminar proyecto   | ✅   | -                                   |
| GET    | `/api/v1/projects/:id/stats` | Estadísticas        | ✅   | -                                   |

### Tasks

| Método | Endpoint            | Descripción      | Auth | Query Params                                                                                             |
| ------ | ------------------- | ---------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| POST   | `/api/v1/tasks`     | Crear tarea      | ✅   | -                                                                                                        |
| GET    | `/api/v1/tasks`     | Listar tareas    | ✅   | `page`, `limit`, `projectId`, `status`, `priority`, `assignedToId`, `search`, `dueDateFrom`, `dueDateTo` |
| GET    | `/api/v1/tasks/:id` | Ver tarea        | ✅   | -                                                                                                        |
| PUT    | `/api/v1/tasks/:id` | Actualizar tarea | ✅   | -                                                                                                        |
| DELETE | `/api/v1/tasks/:id` | Eliminar tarea   | ✅   | -                                                                                                        |

### AI (OpenAI Integration)

| Método | Endpoint                   | Descripción                                       | Auth |
| ------ | -------------------------- | ------------------------------------------------- | ---- |
| POST   | `/api/v1/ai/generate-task` | Genera tarea estructurada desde texto natural     | ✅   |
| POST   | `/api/v1/ai/suggest-tasks` | Sugiere tareas basadas en descripción de proyecto | ✅   |
| POST   | `/api/v1/ai/analyze`       | Analiza texto de entrada (debugging)              | ✅   |

---

## Modelo de Datos

### User

- `id` (UUID)
- `email` (unique)
- `password` (hashed)
- `name`
- `role` (ADMIN | MANAGER | USER)
- `isActive`
- `createdAt`
- `updatedAt`

### Project

- `id` (UUID)
- `name`
- `description`
- `status` (ACTIVE | COMPLETED | ARCHIVED | ON_HOLD)
- `ownerId` (FK → User)
- `startDate`
- `endDate`
- `createdAt`
- `updatedAt`

### Task

- `id` (UUID)
- `title`
- `description`
- `status` (TODO | IN_PROGRESS | IN_REVIEW | DONE | CANCELLED)
- `priority` (LOW | MEDIUM | HIGH | URGENT)
- `projectId` (FK → Project)
- `assignedToId` (FK → User, opcional)
- `dueDate`
- `createdAt`
- `updatedAt`

---

## Seguridad

### Medidas Implementadas

- ✅ **Contraseñas hasheadas** con bcrypt (10 rounds)
- ✅ **JWT** con expiración configurable
- ✅ **Headers de seguridad** con Helmet
- ✅ **CORS** configurado
- ✅ **Validación de inputs** con Zod
- ✅ **Prevención de SQL injection** (Prisma)
- ✅ **Rate limiting** en todas las rutas
- ✅ **Protección contra fuerza bruta** en autenticación

### Autenticación

- Access tokens expiran en 7 días
- Refresh tokens expiran en 30 días
- Tokens firmados con secretos seguros
- Validación de tokens en cada request

### Autorización

- Sistema de roles: ADMIN, MANAGER, USER
- Verificación de propiedad en recursos
- ADMIN tiene acceso completo
- Usuarios solo ven sus propios recursos

---

## Tecnologías Utilizadas

### Backend

- **Runtime:** Node.js v22+
- **Lenguaje:** TypeScript
- **Framework:** Express.js
- **Base de datos:** PostgreSQL 15
- **ORM:** Prisma
- **Autenticación:** JWT + bcrypt
- **Validación:** Zod
- **IA:** OpenAI GPT-3.5-turbo
- **Testing:** Jest + Supertest
- **Containerización:** Docker + Docker Compose

### ¿Por qué estas tecnologías?

- **TypeScript**: Seguridad de tipos, mejor IDE support
- **Prisma**: Type-safe queries, migraciones simples
- **JWT**: Stateless, funciona en múltiples servidores
- **PostgreSQL**: ACID compliance, robusto y probado
- **Zod**: Validación runtime type-safe
- **OpenAI**: IA de última generación para generación de tareas

---

## Testing Implementado

### Estado Actual

✅ **Tests Unitarios**: Implementados para servicios principales
- AuthService (registro, login, refresh token)
- JWTUtil (generación y verificación de tokens)
- ProjectService (CRUD, paginación, filtros, estadísticas)
- TaskService (CRUD, paginación, filtros)

✅ **Tests de Integración**: Implementados para endpoints
- Rutas de autenticación (register, login, refresh-token, me)
- Rutas de proyectos (CRUD, estadísticas)
- Rutas de tareas (CRUD con filtros)
- Rutas de IA (generate-task, suggest-tasks)

✅ **Tests E2E**: Implementados para flujos completos
- Flujo completo de autenticación
- Creación de proyectos y tareas en secuencia

### Estructura de Tests

```
tests/
├── setup.ts                    # Configuración global de tests
├── unit/                       # Tests unitarios
│   └── services/
│       ├── auth.service.test.ts
│       ├── jwt.util.test.ts
│       ├── project.service.test.ts
│       └── task.service.test.ts
├── integration/                 # Tests de integración
│   ├── auth.routes.test.ts
│   ├── projects.routes.test.ts
│   ├── tasks.routes.test.ts
│   └── ai.routes.test.ts
└── e2e/                        # Tests end-to-end
    └── auth-flow.test.ts
```

### Configuración

Los tests utilizan **Jest** con **ts-jest** para TypeScript. La configuración está en `jest.config.js`:

- **Preset**: ts-jest
- **Environment**: node
- **Coverage**: HTML, LCOV, texto
- **Timeout**: 10 segundos por test
- **Setup**: `tests/setup.ts` se ejecuta antes de cada suite

### Variables de Entorno para Tests

Las variables de entorno se configuran automáticamente en `tests/setup.ts`:

```typescript
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret...';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_taskmaster';
// ... más variables
```

### Ejemplos de Tests

#### Test Unitario - AuthService

```typescript
describe('AuthService', () => {
  it('debería registrar un nuevo usuario exitosamente', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'Password123',
      name: 'Test User',
    };

    const result = await authService.register(userData);

    expect(result.user.email).toBe(userData.email);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('debería lanzar error si el email ya existe', async () => {
    // Mock de usuario existente
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'existing-id',
      email: 'existing@example.com',
    });

    await expect(authService.register(userData)).rejects.toThrow(
      'Email already registered'
    );
  });
});
```

#### Test de Integración - Endpoints

```typescript
describe('POST /api/v1/auth/login', () => {
  it('debería hacer login exitosamente', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123',
      })
      .expect(200);

    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
  });

  it('debería retornar error 401 con credenciales inválidas', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword',
      })
      .expect(401);

    expect(response.body.error).toBe('Login failed');
  });
});
```

#### Test E2E - Flujo Completo

```typescript
describe('E2E: Auth Flow', () => {
  it('debería completar el flujo completo de autenticación', async () => {
    // 1. Registrar usuario
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);

    // 2. Hacer login
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    // 3. Usar accessToken
    const projectsResponse = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(200);

    // 4. Renovar token
    const refreshResponse = await request(app)
      .post('/api/v1/auth/refresh-token')
      .send({ refreshToken: loginResponse.body.data.refreshToken })
      .expect(200);

    // 5. Continuar usando la API
    expect(refreshResponse.body.data.accessToken).toBeDefined();
  });
});
```

### Mocking

Los tests utilizan mocks para:

- **Prisma**: Base de datos mockeada para tests unitarios
- **bcrypt**: Hashing de contraseñas
- **JWT**: Generación y verificación de tokens
- **OpenAI**: Servicio de IA (para tests de integración)

### Cobertura

- **Servicios**: ~80% de cobertura
- **Endpoints**: ~75% de cobertura
- **Utilidades**: ~90% de cobertura
- **Total**: ~80% de cobertura general

### Ejecutar Tests

```bash
# Todos los tests con coverage
npm test

# Solo tests unitarios
npm run test:unit

# Solo tests de integración
npm run test:integration

# Solo tests E2E
npm run test:e2e

# Tests en modo watch (desarrollo)
npm run test:watch

# Ver coverage en HTML
npm test -- --coverage
# Luego abre: coverage/index.html
```

### Mejores Prácticas Implementadas

- ✅ **Tests aislados**: No dependen unos de otros
- ✅ **Limpieza de datos**: Después de cada test suite
- ✅ **Mocks apropiados**: Para dependencias externas
- ✅ **Cobertura de casos**: Exitosos y de error
- ✅ **Tests descriptivos**: Nombres claros y específicos
- ✅ **Configuración centralizada**: En setup.ts
- ✅ **TypeScript**: Tests completamente tipados

## Mejoras Futuras

### Prioridad Alta

- [x] Tests automatizados (unitarios, integración, E2E) ✅
- [ ] Aumentar cobertura de tests al 90%+
- [ ] Comentarios en tareas
- [ ] Soft deletes (eliminación lógica)
- [ ] Historial de cambios (audit log)

### Prioridad Media

- [ ] Búsqueda full-text mejorada
- [ ] Notificaciones por email
- [ ] Archivos adjuntos
- [ ] WebSockets para actualizaciones en tiempo real

### Prioridad Baja

- [ ] Caching con Redis
- [ ] Background jobs con Bull
- [ ] Exportación de datos (PDF, Excel)
- [ ] Dashboard con gráficos
- [ ] Etiquetas/tags para tareas
- [ ] Subtareas
- [ ] Time tracking

---

## Flujo Completo del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ 1. Login
                       ▼
┌─────────────────────────────────────────────────────────┐
│              POST /api/v1/auth/login                     │
│  Rate Limiting: 5 intentos / 15 min                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Respuesta: { accessToken, refreshToken }
                       ▼
┌─────────────────────────────────────────────────────────┐
│         Usa accessToken en todas las peticiones          │
│                                                          │
│  GET /api/v1/projects?page=1&limit=10&search=web        │
│  Rate Limiting: 100 peticiones / 15 min                 │
│  → Respuesta con paginación y filtros aplicados         │
│                                                          │
│  GET /api/v1/projects/123/stats                         │
│  → Respuesta con estadísticas detalladas                │
│                                                          │
│  POST /api/v1/ai/generate-task                          │
│  → Usa OpenAI para generar tarea                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Si accessToken expira...
                       ▼
┌─────────────────────────────────────────────────────────┐
│         POST /api/v1/auth/refresh-token                 │
│  Rate Limiting: 5 intentos / 15 min                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Respuesta: { nuevo accessToken, nuevo refreshToken }
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Continúa usando la API                     │
└─────────────────────────────────────────────────────────┘
```

---

## Guía de Pruebas

### Prueba 1: Flujo de Autenticación Completo

```bash
# 1. Registrar usuario
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User"
  }'

# 2. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'

# 3. Usar accessToken
curl -X GET http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI"

# 4. Renovar token
curl -X POST http://localhost:3000/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "TU_REFRESH_TOKEN_AQUI"
  }'
```

### Prueba 2: Paginación y Filtros

```bash
# Listar proyectos con paginación
curl -X GET "http://localhost:3000/api/v1/projects?page=1&limit=5" \
  -H "Authorization: Bearer TU_TOKEN"

# Buscar proyectos activos
curl -X GET "http://localhost:3000/api/v1/projects?status=ACTIVE&page=1&limit=10" \
  -H "Authorization: Bearer TU_TOKEN"
```

### Prueba 3: Integración con OpenAI

```bash
# Generar tarea con IA
curl -X POST http://localhost:3000/api/v1/ai/generate-task \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userInput": "Revisar código del módulo de autenticación mañana, es urgente",
    "projectId": "PROJECT_ID"
  }'
```

---

## Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Producción
npm test             # Ejecutar todos los tests con coverage
npm run test:unit    # Solo tests unitarios
npm run test:integration # Solo tests de integración
npm run test:e2e     # Solo tests E2E
npm run test:watch   # Tests en modo watch
npm run lint         # ESLint
npm run lint:fix     # ESLint con auto-fix
npm run format       # Prettier
npm run format:check # Verificar formato sin cambiar
npm run prisma:studio # Abrir Prisma Studio
npm run convert:word # Convertir Markdown a Word
```

---

## Docker

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

---

## Contacto y Soporte

**Autor:** Hyrum Isaac Carrasco Inzunza

- GitHub: [@HyrumDev7](https://github.com/HyrumDev7)
- LinkedIn: [hyrum-dev](https://www.linkedin.com/in/hyrum-dev/)
- Email: hyrumcarrasco7@gmail.com

---

## Documentación Adicional

- **Arquitectura detallada**: Ver [ARCHITECTURE.md](ARCHITECTURE.md)
- **Funcionalidades detalladas**: Ver [FUNCIONALIDADES.md](FUNCIONALIDADES.md)
- **API Interactiva**: `http://localhost:3000/api-docs`

---

## Licencia

MIT License

---

---

## Resumen de Implementación

### ✅ Funcionalidades Completadas

1. **Autenticación y Autorización**
   - ✅ Registro de usuarios
   - ✅ Login con JWT
   - ✅ Refresh token para renovación
   - ✅ Sistema de roles (ADMIN, MANAGER, USER)
   - ✅ Middleware de autenticación

2. **Gestión de Proyectos**
   - ✅ CRUD completo
   - ✅ Paginación
   - ✅ Filtros (status, búsqueda)
   - ✅ Estadísticas avanzadas

3. **Gestión de Tareas**
   - ✅ CRUD completo
   - ✅ Paginación
   - ✅ Filtros avanzados (múltiples criterios)
   - ✅ Asignación de usuarios

4. **Integración con OpenAI**
   - ✅ Generación de tareas desde texto natural
   - ✅ Sugerencias de tareas para proyectos
   - ✅ Análisis de texto
   - ✅ Validación robusta de respuestas

5. **Seguridad**
   - ✅ Rate limiting (general, auth, creación)
   - ✅ Validación con Zod
   - ✅ Headers de seguridad (Helmet)
   - ✅ CORS configurado

6. **Documentación**
   - ✅ Swagger/OpenAPI interactiva
   - ✅ Documentación técnica completa
   - ✅ Guías de uso y ejemplos

7. **Testing**
   - ✅ Tests unitarios
   - ✅ Tests de integración
   - ✅ Tests E2E
   - ✅ Configuración de coverage

### 📊 Estadísticas del Proyecto

- **Endpoints**: 20+ endpoints implementados
- **Modelos de datos**: 3 (User, Project, Task)
- **Tests**: 30+ tests implementados
- **Cobertura**: ~80% de código cubierto
- **Líneas de código**: ~5000+ líneas

---

**Última actualización:** Enero 2024
