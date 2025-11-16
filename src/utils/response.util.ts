import { Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status';

/**
 * Utilidad para respuestas HTTP estandarizadas
 * Mejora la consistencia de las respuestas de la API
 */
export class ResponseUtil {
  /**
   * Respuesta exitosa genérica
   */
  static success(res: Response, data: any, message = 'Success', statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Respuesta de error genérica
   */
  static error(
    res: Response,
    message: string,
    statusCode = HTTP_STATUS.BAD_REQUEST,
    details?: any
  ) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(details && { details }),
    });
  }

  /**
   * Respuesta para recursos creados (201)
   */
  static created(res: Response, data: any, message = 'Resource created successfully') {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  /**
   * Respuesta para recurso no encontrado (404)
   */
  static notFound(res: Response, message = 'Resource not found') {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND);
  }

  /**
   * Respuesta para no autorizado (401)
   */
  static unauthorized(res: Response, message = 'Unauthorized - Authentication required') {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  /**
   * Respuesta para prohibido (403)
   */
  static forbidden(res: Response, message = 'Forbidden - Insufficient permissions') {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN);
  }

  /**
   * Respuesta para error de validación (400)
   */
  static validationError(res: Response, details: any) {
    return this.error(res, 'Validation failed', HTTP_STATUS.BAD_REQUEST, details);
  }

  /**
   * Respuesta para conflicto (409) - ej: email ya existe
   */
  static conflict(res: Response, message = 'Resource already exists') {
    return this.error(res, message, HTTP_STATUS.CONFLICT);
  }

  /**
   * Respuesta para error interno del servidor (500)
   */
  static serverError(res: Response, message = 'Internal server error') {
    return this.error(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
