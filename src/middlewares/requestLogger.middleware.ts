import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.util';

/**
 * Middleware para loguear todas las requests HTTP
 * Útil para debugging y monitoreo
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log de entrada
  Logger.info(`→ ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log de salida cuando la respuesta termine
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logMessage = `← ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`;

    if (res.statusCode >= 500) {
      Logger.error(logMessage);
    } else if (res.statusCode >= 400) {
      Logger.warn(logMessage);
    } else {
      Logger.success(logMessage);
    }
  });

  next();
};
