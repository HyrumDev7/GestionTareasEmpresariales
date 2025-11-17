/**
 * Mensajes de error centralizados
 * Facilita traducciones y consistencia
 */
export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  ACCOUNT_DEACTIVATED: 'Account is deactivated',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_REQUIRED: 'Authentication token required',
  WEAK_PASSWORD: 'Password does not meet security requirements',

  // Authorization
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action',
  UNAUTHORIZED_ACTION: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access forbidden',

  // Projects
  PROJECT_NOT_FOUND: 'Project not found',
  PROJECT_NAME_REQUIRED: 'Project name is required',
  PROJECT_NAME_TOO_SHORT: 'Project name must be at least 3 characters',
  PROJECT_ALREADY_EXISTS: 'Project with this name already exists',

  // Tasks
  TASK_NOT_FOUND: 'Task not found',
  TASK_TITLE_REQUIRED: 'Task title is required',
  TASK_INVALID_STATUS: 'Invalid task status',
  TASK_INVALID_PRIORITY: 'Invalid task priority',

  // Users
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  USER_INACTIVE: 'User account is inactive',

  // Validation
  INVALID_INPUT: 'Invalid input data',
  VALIDATION_FAILED: 'Validation failed',
  INVALID_EMAIL: 'Invalid email format',
  REQUIRED_FIELD: 'This field is required',
  INVALID_DATE: 'Invalid date format',
  DATE_IN_PAST: 'Date cannot be in the past',

  // Server
  INTERNAL_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  NETWORK_ERROR: 'Network error occurred',
} as const;

export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
