import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';

const PORT = env.PORT;

async function startServer() {
  try {
    // Test database connection
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start HTTP server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 TaskMaster Pro API Server');
      console.log('='.repeat(50));
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 Environment: ${env.NODE_ENV}`);
      console.log(`🗄️  Database: Connected`);
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  process.exit(1);
});

startServer();
