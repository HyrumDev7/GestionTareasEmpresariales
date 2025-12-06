"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('3000'),
    API_VERSION: zod_1.z.string().default('v1'),
    DATABASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('30d'),
    ALLOWED_ORIGINS: zod_1.z.string().default('http://localhost:3000'),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().default('900000'),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().default('100'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    OPENAI_API_KEY: zod_1.z.string().min(20, 'OpenAI API key required'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment variables');
}
exports.env = {
    NODE_ENV: parsed.data.NODE_ENV,
    PORT: parseInt(parsed.data.PORT, 10),
    API_VERSION: parsed.data.API_VERSION,
    IS_PRODUCTION: parsed.data.NODE_ENV === 'production',
    IS_DEVELOPMENT: parsed.data.NODE_ENV === 'development',
    IS_TEST: parsed.data.NODE_ENV === 'test',
    DATABASE_URL: parsed.data.DATABASE_URL,
    JWT_SECRET: parsed.data.JWT_SECRET,
    JWT_EXPIRES_IN: parsed.data.JWT_EXPIRES_IN,
    JWT_REFRESH_SECRET: parsed.data.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: parsed.data.JWT_REFRESH_EXPIRES_IN,
    ALLOWED_ORIGINS: parsed.data.ALLOWED_ORIGINS.split(','),
    RATE_LIMIT_WINDOW_MS: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS, 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(parsed.data.RATE_LIMIT_MAX_REQUESTS, 10),
    LOG_LEVEL: parsed.data.LOG_LEVEL,
    OPENAI_API_KEY: parsed.data.OPENAI_API_KEY,
};
//# sourceMappingURL=env.js.map