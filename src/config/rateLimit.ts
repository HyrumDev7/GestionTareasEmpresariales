import { env } from './env';

/**
 * Configuración de rate limiting para API
 * Previene abuso y ataques DDoS
 */

/**
 * Rate limit general para todas las rutas
 */
export const rateLimitConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutos
  max: env.RATE_LIMIT_MAX_REQUESTS, // 100 requests
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Incluye headers RateLimit-*
  legacyHeaders: false, // Deshabilita X-RateLimit-*
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

/**
 * Rate limit más estricto para rutas de autenticación
 * Previene ataques de fuerza bruta
 */
export const authRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No cuenta logins exitosos
};

/**
 * Rate limit para creación de recursos
 * Previene spam
 */
export const createResourceRateLimitConfig = {
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 creaciones por minuto
  message: 'Too many resources created, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
};
