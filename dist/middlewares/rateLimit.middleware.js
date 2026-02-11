"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResourceRateLimiter = exports.authRateLimiter = exports.generalRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rateLimit_1 = require("../config/rateLimit");
exports.generalRateLimiter = (0, express_rate_limit_1.default)(rateLimit_1.rateLimitConfig);
exports.authRateLimiter = (0, express_rate_limit_1.default)(rateLimit_1.authRateLimitConfig);
exports.createResourceRateLimiter = (0, express_rate_limit_1.default)(rateLimit_1.createResourceRateLimitConfig);
//# sourceMappingURL=rateLimit.middleware.js.map