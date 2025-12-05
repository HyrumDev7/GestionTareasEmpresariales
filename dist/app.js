"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.ALLOWED_ORIGINS,
    credentials: true,
}));
if (env_1.env.IS_DEVELOPMENT) {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env_1.env.NODE_ENV,
        database: 'connected',
    });
});
app.get('/', (_req, res) => {
    res.json({
        message: '🚀 TaskMaster Pro API',
        version: env_1.env.API_VERSION,
        documentation: '/api-docs',
        health: '/health',
        endpoints: {
            auth: '/api/v1/auth',
        },
    });
});
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/projects', project_routes_1.default);
app.use('/api/v1/tasks', task_routes_1.default);
app.use((_req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist',
    });
});
app.use((err, _req, res, _next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: env_1.env.IS_PRODUCTION ? 'Something went wrong' : err.message,
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map