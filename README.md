# 🚀 TaskMaster Pro - API

Sistema de gestión de tareas empresarial con autenticación JWT y autorización por roles.

## 📋 Descripción

TaskMaster Pro es una API REST construida con Node.js, TypeScript y PostgreSQL que permite a los usuarios gestionar proyectos y tareas con diferentes niveles de permisos.

### ✨ Características Principales

- 🔐 **Autenticación JWT** con access y refresh tokens
- 👥 **Sistema de roles** (ADMIN, MANAGER, USER)
- 📁 **Gestión de proyectos** con CRUD completo
- ✅ **Gestión de tareas** con asignación y prioridades
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

## 🔑 API Endpoints

### Autenticación

| Método | Endpoint                | Descripción        | Auth |
| ------ | ----------------------- | ------------------ | ---- |
| POST   | `/api/v1/auth/register` | Registrar usuario  | ❌   |
| POST   | `/api/v1/auth/login`    | Iniciar sesión     | ❌   |
| GET    | `/api/v1/auth/me`       | Perfil del usuario | ✅   |

### Projects

| Método | Endpoint                     | Descripción         | Auth |
| ------ | ---------------------------- | ------------------- | ---- |
| POST   | `/api/v1/projects`           | Crear proyecto      | ✅   |
| GET    | `/api/v1/projects`           | Listar proyectos    | ✅   |
| GET    | `/api/v1/projects/:id`       | Ver proyecto        | ✅   |
| PUT    | `/api/v1/projects/:id`       | Actualizar proyecto | ✅   |
| DELETE | `/api/v1/projects/:id`       | Eliminar proyecto   | ✅   |
| GET    | `/api/v1/projects/:id/stats` | Estadísticas        | ✅   |

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

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT con expiración configurable
- Headers de seguridad con Helmet
- CORS configurado
- Validación de inputs con Zod
- SQL injection prevention (Prisma)

## 👨‍💻 Autor

**Hyrum Isaac Carrasco Inzunza**

- GitHub: [@tu-usuario](https://github.com/HyrumDev7)
- LinkedIn: [Tu Perfil](https://www.linkedin.com/in/hyrum-dev/)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue primero para discutir los cambios.

## 📞 Contacto

Para preguntas o colaboraciones: hyrumcarrasco7@gmail.com
