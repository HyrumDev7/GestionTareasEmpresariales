"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("./env");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        log: env_1.env.IS_DEVELOPMENT ? ['query', 'error', 'warn'] : ['error'],
    });
};
exports.prisma = globalThis.prisma ?? prismaClientSingleton();
if (env_1.env.IS_DEVELOPMENT) {
    globalThis.prisma = exports.prisma;
}
process.on('beforeExit', async () => {
    console.log('🔌 Disconnecting from database...');
    await exports.prisma.$disconnect();
});
process.on('SIGINT', async () => {
    console.log('\n🔌 Disconnecting from database...');
    await exports.prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('🔌 Disconnecting from database...');
    await exports.prisma.$disconnect();
    process.exit(0);
});
//# sourceMappingURL=database.js.map