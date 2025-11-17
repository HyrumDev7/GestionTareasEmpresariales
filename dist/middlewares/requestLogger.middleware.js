"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_util_1 = require("../utils/logger.util");
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    logger_util_1.Logger.info(`→ ${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logMessage = `← ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`;
        if (res.statusCode >= 500) {
            logger_util_1.Logger.error(logMessage);
        }
        else if (res.statusCode >= 400) {
            logger_util_1.Logger.warn(logMessage);
        }
        else {
            logger_util_1.Logger.success(logMessage);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.middleware.js.map