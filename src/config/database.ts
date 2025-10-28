import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Extend global type to include prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Singleton pattern para evitar múltiples conexiones
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: env.IS_DEVELOPMENT ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Reutilizar instancia en hot-reload (desarrollo)
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (env.IS_DEVELOPMENT) {
  globalThis.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  console.log('🔌 Disconnecting from database...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('\n🔌 Disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔌 Disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});
