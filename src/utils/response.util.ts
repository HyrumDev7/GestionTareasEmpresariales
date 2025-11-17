import { Response } from 'express';

export class ResponseUtil {
  static success(res: Response, data: any, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, message: string, statusCode = 400, details?: any) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(details && { details }),
    });
  }

  static created(res: Response, data: any, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static notFound(res: Response, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static unauthorized(res: Response, message = 'Unauthorized - Authentication required') {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden - Insufficient permissions') {
    return this.error(res, message, 403);
  }

  static validationError(res: Response, details: any) {
    return this.error(res, 'Validation failed', 400, details);
  }

  static conflict(res: Response, message = 'Resource already exists') {
    return this.error(res, message, 409);
  }

  static serverError(res: Response, message = 'Internal server error') {
    return this.error(res, message, 500);
  }
}
