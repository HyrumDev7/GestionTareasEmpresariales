"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseUtil = void 0;
class ResponseUtil {
    static success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }
    static error(res, message, statusCode = 400, details) {
        return res.status(statusCode).json({
            success: false,
            error: message,
            ...(details && { details }),
        });
    }
    static created(res, data, message = 'Resource created successfully') {
        return this.success(res, data, message, 201);
    }
    static notFound(res, message = 'Resource not found') {
        return this.error(res, message, 404);
    }
    static unauthorized(res, message = 'Unauthorized - Authentication required') {
        return this.error(res, message, 401);
    }
    static forbidden(res, message = 'Forbidden - Insufficient permissions') {
        return this.error(res, message, 403);
    }
    static validationError(res, details) {
        return this.error(res, 'Validation failed', 400, details);
    }
    static conflict(res, message = 'Resource already exists') {
        return this.error(res, message, 409);
    }
    static serverError(res, message = 'Internal server error') {
        return this.error(res, message, 500);
    }
}
exports.ResponseUtil = ResponseUtil;
//# sourceMappingURL=response.util.js.map