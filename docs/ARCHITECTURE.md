# 🏗️ TaskMaster Pro - Architecture Documentation

## System Overview

TaskMaster Pro follows a **layered architecture** pattern with clear separation of concerns.

## Architecture Layers

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

## Security Architecture

### Authentication Flow

1. User sends credentials (email + password)
2. Backend verifies with bcrypt
3. Generate JWT tokens (access + refresh)
4. Client stores tokens
5. Client sends token in Authorization header
6. Middleware verifies JWT signature
7. Extract user info from token
8. Attach to request object

### Authorization Flow

1. Request arrives with valid JWT
2. Extract user role from token
3. Check route permissions
4. For resource-specific actions:
   - Verify ownership (userId === ownerId)
   - OR verify ADMIN role
5. Allow or deny request

## Database Design

### Entity Relationships

```
User (1) ──── (N) Project
  │
  │
  └──── (N) Task

Project (1) ──── (N) Task
```

### Key Design Decisions

- **UUID as Primary Keys**: Better for distributed systems
- **Cascade Deletes**: Delete project → delete all tasks
- **Set Null on User Delete**: Keep tasks but unassign user
- **Indexes**: On foreign keys and frequently queried fields
- **Enums**: For status and priority (data integrity)

## API Design Principles

### RESTful Conventions

- **GET**: Read resources (idempotent)
- **POST**: Create resources
- **PUT**: Update entire resource
- **PATCH**: Partial update (future)
- **DELETE**: Remove resource (idempotent)

### Response Format

**Success:**

```json
{
  "message": "Descriptive success message",
  "data": { ... },
  "count": 10  // For lists
}
```

**Error:**

```json
{
  "error": "Error category",
  "message": "Detailed error message"
}
```

### HTTP Status Codes

- `200 OK`: Success (GET, PUT, DELETE)
- `201 Created`: Resource created (POST)
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error

## Technology Choices

### Why TypeScript?

- Type safety prevents runtime errors
- Better IDE support (autocomplete)
- Self-documenting code
- Easier refactoring

### Why Prisma?

- Type-safe queries
- Auto-generated types
- Simple migrations
- Excellent DX (Developer Experience)

### Why JWT?

- Stateless (no session storage)
- Works across multiple servers
- Contains user info (no DB lookup)
- Industry standard

### Why PostgreSQL?

- ACID compliance
- Robust and battle-tested
- Great for relational data
- Advanced features (JSON, full-text search)

## Deployment Architecture (Future)

```
┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │
│  Vercel/     │ API │  Railway/    │
│  Netlify     │     │  Render      │
└──────────────┘     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │  PostgreSQL  │
                     │  (Managed)   │
                     └──────────────┘
```

## Future Improvements

- [ ] Implement refresh token rotation
- [ ] Add rate limiting per user
- [ ] Implement soft deletes
- [ ] Add full-text search
- [ ] WebSocket for real-time updates
- [ ] Caching with Redis
- [ ] Background jobs with Bull
- [ ] Email notifications
- [ ] File uploads (avatars, attachments)
- [ ] Audit logs
