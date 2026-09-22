import express, { type Express } from 'express';
import { createCorsMiddleware } from './middleware/cors.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { healthRouter } from './routes/health.routes';
import { createSprintRouter } from './routes/sprint.routes';
import { LocalStorageService } from './services/storage.service';
import { GeminiService } from './services/gemini.service';
import { AnalysisService } from './services/analysis.service';
import type { AppEnv } from './config/env';

export function createApp(
  env: Pick<AppEnv, 'FRONTEND_ORIGIN' | 'GEMINI_MODEL'> & { geminiApiKey?: string },
): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(createCorsMiddleware(env.FRONTEND_ORIGIN));
  app.use(express.json());
  app.use('/api/health', healthRouter);

  // Initialize storage service (will be replaced with GCS in Phase 8)
  const storageService = new LocalStorageService();

  // Initialize optional analysis services (requires Gemini API key)
  let analysisService: AnalysisService | undefined;
  if (env.geminiApiKey) {
    const geminiService = new GeminiService(env.geminiApiKey, env.GEMINI_MODEL || 'gemini-3.5-flash');
    analysisService = new AnalysisService(storageService, geminiService);
  }

  app.use('/api/sprints', createSprintRouter(storageService, analysisService));

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

