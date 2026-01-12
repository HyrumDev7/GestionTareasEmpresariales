# 🚀 TaskMaster Pro - API

Sistema de gestión de tareas empresarial con autenticación JWT y autorización por roles.

## 📋 Descripción

TaskMaster Pro es una API REST construida con Node.js, TypeScript y PostgreSQL que permite a los usuarios gestionar proyectos y tareas con diferentes niveles de permisos.

### ✨ Características Principales

- 🔐 **Autenticación JWT** con access y refresh tokens
- 👥 **Sistema de roles** (ADMIN, MANAGER, USER)
- 📁 **Gestión de proyectos** con CRUD completo
- ✅ **Gestión de tareas** con asignación y prioridades
- 🤖 **Integración con OpenAI** para generación inteligente de tareas
- 🔒 **Seguridad** (bcrypt, helmet, CORS)
- ✅ **Validación de datos** con Zod
- 🗄️ **Base de datos** PostgreSQL con Prisma ORM
- 🐳 **Docker** para entorno de desarrollo

## 🛠️ Tecnologías

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

## 📦 Instalación

### Prerequisitos

- Node.js 18+
- Docker Desktop
- Git

### Pasos

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
- `JWT_SECRET` y `JWT_REFRESH_SECRET`: Claves secretas para JWT (mínimo 32 caracteres)

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

## 🔑 API Endpoints

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

**Ejemplo de uso:**

```bash
# Generar tarea desde texto natural
curl -X POST http://localhost:3000/api/v1/ai/generate-task \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userInput": "Revisar código del módulo de autenticación mañana, es urgente",
    "projectId": "uuid-del-proyecto"
  }'
```

**Características de la IA:**

- ✅ Reconocimiento automático de prioridades (urgente, importante, etc.)
- ✅ Interpretación de fechas relativas (mañana, próxima semana)
- ✅ Estimación de tiempo cuando se menciona
- ✅ Validación robusta de respuestas
- ✅ Manejo completo de errores (rate limits, API key, etc.)

## 🏗️ Arquitectura

```
src/
├── controllers/    # Maneja requests HTTP
├── services/       # Lógica de negocio
├── repositories/   # Acceso a datos (futuro)
├── middlewares/    # Auth, validación, errores
├── routes/         # Definición de rutas
├── dtos/           # Validación con Zod
├── utils/          # Funciones auxiliares
├── types/          # Tipos TypeScript
└── config/         # Configuración (DB, ENV)
```

## 🗄️ Modelo de Datos

### User

- id (UUID)
- email (unique)
- password (hashed)
- name
- role (ADMIN | MANAGER | USER)
- isActive

### Project

- id (UUID)
- name
- description
- status (ACTIVE | COMPLETED | ARCHIVED | ON_HOLD)
- ownerId (FK → User)
- startDate
- endDate

### Task

- id (UUID)
- title
- description
- status (TODO | IN_PROGRESS | IN_REVIEW | DONE | CANCELLED)
- priority (LOW | MEDIUM | HIGH | URGENT)
- projectId (FK → Project)
- assignedToId (FK → User)
- dueDate

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 🚀 Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Producción
npm test             # Tests
npm run lint         # ESLint
npm run format       # Prettier
npm run prisma:studio # Abrir Prisma Studio
```

## 🐳 Docker

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 📚 Documentación API

La documentación interactiva de la API está disponible en Swagger UI:

```
http://localhost:3000/api-docs
```

Incluye:

- Descripción de todos los endpoints
- Esquemas de request/response
- Ejemplos de uso
- Pruebas interactivas

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT con access y refresh tokens
- Rate limiting configurable (previene abuso y DDoS)
- Headers de seguridad con Helmet
- CORS configurado
- Validación de inputs con Zod
- SQL injection prevention (Prisma)

### Rate Limiting

- **General:** 100 requests por 15 minutos (configurable)
- **Autenticación:** 5 intentos por 15 minutos
- **Creación de recursos:** 10 creaciones por minuto

## 👨‍💻 Autor

**Hyrum Isaac Carrasco Inzunza**

- GitHub: [@tu-usuario](https://github.com/HyrumDev7)
- LinkedIn: [Tu Perfil](https://www.linkedin.com/in/hyrum-dev/)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue primero para discutir los cambios.

## 📞 Contacto

Para preguntas o colaboraciones: hyrumcarrasco7@gmail.com
