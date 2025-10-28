"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const PORT = env_1.env.PORT;
async function startServer() {
    try {
        console.log('🔌 Connecting to database...');
        await database_1.prisma.$connect();
        console.log('✅ Database connected successfully');
        app_1.default.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🚀 TaskMaster Pro API Server');
            console.log('='.repeat(50));
            console.log(`📡 Server running on: http://localhost:${PORT}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 Environment: ${env_1.env.NODE_ENV}`);
            console.log(`🗄️  Database: Connected`);
            console.log('='.repeat(50) + '\n');
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        await database_1.prisma.$disconnect();
        process.exit(1);
    }
}
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Promise Rejection:', reason);
    process.exit(1);
});
startServer();
//# sourceMappingURL=server.js.map