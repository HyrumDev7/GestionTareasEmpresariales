"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_MESSAGE = exports.HTTP_STATUS = void 0;
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};
exports.HTTP_MESSAGE = {
    OK: 'Request successful',
    CREATED: 'Resource created successfully',
    NO_CONTENT: 'No content',
    BAD_REQUEST: 'Invalid request',
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Insufficient permissions',
    NOT_FOUND: 'Resource not found',
    CONFLICT: 'Resource already exists',
    INTERNAL_SERVER_ERROR: 'Internal server error',
};
//# sourceMappingURL=http-status.js.map