/**
 * HTTP Status Codes
 * Centralizados para usar en toda la aplicación
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const HTTP_MESSAGE = {
  // Success
  OK: 'Request successful',
  CREATED: 'Resource created successfully',
  NO_CONTENT: 'No content',

  // Client Errors
  BAD_REQUEST: 'Invalid request',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource already exists',

  // Server Errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
} as const;