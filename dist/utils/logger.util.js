"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const env_1 = require("../config/env");
class Logger {
    static formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaStr}`;
    }
    static info(message, meta) {
        if (env_1.env.IS_DEVELOPMENT) {
            console.log(this.formatMessage('INFO', message, meta));
        }
    }
    static error(message, error) {
        console.error(this.formatMessage('ERROR', message, error));
    }
    static warn(message, meta) {
        console.warn(this.formatMessage('WARN', message, meta));
    }
    static debug(message, meta) {
        if (env_1.env.IS_DEVELOPMENT) {
            console.debug(this.formatMessage('DEBUG', message, meta));
        }
    }
    static success(message, meta) {
        if (env_1.env.IS_DEVELOPMENT) {
            console.log(this.formatMessage('SUCCESS', message, meta));
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.util.js.map