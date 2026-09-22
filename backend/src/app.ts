import express, { type Express } from 'express';
import { createCorsMiddleware } from './middleware/cors.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { healthRouter } from './routes/health.routes';
import { createSprintRouter } from './routes/sprint.routes';
import { LocalStorageService } from './services/storage.service';
import type { AppEnv } from './config/env';

export function createApp(env: Pick<AppEnv, 'FRONTEND_ORIGIN'>): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(createCorsMiddleware(env.FRONTEND_ORIGIN));
  app.use(express.json());
  app.use('/api/health', healthRouter);

  // Initialize storage service (will be replaced with GCS in Phase 8)
  const storageService = new LocalStorageService();
  app.use('/api/sprints', createSprintRouter(storageService));

  app.get('/api', (_req, res) => {
    res.json({
      service: 'retrovoice-backend',
      status: 'ok',
    });
  });

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  app.use(errorMiddleware);

  return app;
}

