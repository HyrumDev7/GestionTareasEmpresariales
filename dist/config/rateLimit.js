"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResourceRateLimitConfig = exports.authRateLimitConfig = exports.rateLimitConfig = void 0;
const env_1 = require("./env");
exports.rateLimitConfig = {
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
};
exports.authRateLimitConfig = {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
};
exports.createResourceRateLimitConfig = {
    windowMs: 60 * 1000,
    max: 10,
    message: 'Too many resources created, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
};
//# sourceMappingURL=rateLimit.js.map