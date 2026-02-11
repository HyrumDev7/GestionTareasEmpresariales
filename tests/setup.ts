/**
 * Configuración global para tests
 * Se ejecuta antes de cada test suite
 * IMPORTANTE: Estas variables deben estar configuradas ANTES de importar cualquier módulo
 */

// Mock de variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-characters-long-for-testing';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_taskmaster?schema=public';
process.env.OPENAI_API_KEY = 'sk-test-openai-api-key-minimum-20-characters-long';
process.env.PORT = '3000';
process.env.API_VERSION = 'v1';
process.env.JWT_EXPIRES_IN = '7d';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.LOG_LEVEL = 'info';

// Limpiar console.log en tests (opcional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Timeout global para tests
jest.setTimeout(10000);

// Limpiar después de todos los tests
afterAll(async () => {
  // Cerrar conexiones si es necesario
});
