import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';

const app: Application = express();

// ============================================
// SECURITY MIDDLEWARES
// ============================================
app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  })
);

// ============================================
// LOGGING
// ============================================
if (env.IS_DEVELOPMENT) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// BODY PARSERS
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    database: 'connected',
  });
});

// ============================================
// API ROOT
// ============================================
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🚀 TaskMaster Pro API',
    version: env.API_VERSION,
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      auth: '/api/v1/auth',
    },
  });
});

// ============================================
// API ROUTES
// ============================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);

// ============================================
// 404 HANDLER
// ============================================
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error:', err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: env.IS_PRODUCTION ? 'Something went wrong' : err.message,
  });
});

export default app;
