import rateLimit from 'express-rate-limit';
import {
  rateLimitConfig,
  authRateLimitConfig,
  createResourceRateLimitConfig,
} from '../config/rateLimit';

/**
 * Rate limiter general para todas las rutas
 */
export const generalRateLimiter = rateLimit(rateLimitConfig);

/**
 * Rate limiter estricto para rutas de autenticación
 * Previene ataques de fuerza bruta
 */
export const authRateLimiter = rateLimit(authRateLimitConfig);

/**
 * Rate limiter para creación de recursos
 * Previene spam
 */
export const createResourceRateLimiter = rateLimit(createResourceRateLimitConfig);
