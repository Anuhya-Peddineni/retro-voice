import express, { type Express } from 'express';
import { createCorsMiddleware } from './middleware/cors.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { healthRouter } from './routes/health.routes';
import { createSprintRouter } from './routes/sprint.routes';
import {
  GoogleCloudStorageService,
  type IStorageService,
} from './services/storage.service';
import { GeminiService } from './services/gemini.service';
import { AnalysisService } from './services/analysis.service';
import type { AppEnv } from './config/env';

export interface AppDependencies {
  storageService?: IStorageService;
  analysisService?: AnalysisService;
}

export function createApp(
  env: Pick<AppEnv, 'FRONTEND_ORIGIN'> &
    Partial<Pick<AppEnv, 'GEMINI_MODEL'>> &
    Partial<Pick<AppEnv, 'GOOGLE_CLOUD_PROJECT' | 'GCS_BUCKET_NAME' | 'GOOGLE_GENAI_LOCATION'>>,
  dependencies: AppDependencies = {},
): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(createCorsMiddleware(env.FRONTEND_ORIGIN));
  app.use(express.json());
  app.use('/api/health', healthRouter);

  const storageService = dependencies.storageService ?? createGoogleCloudStorageService(env);

  const analysisService = dependencies.analysisService ?? createAnalysisService(env, storageService);

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

function createGoogleCloudStorageService(
  env: Partial<Pick<AppEnv, 'GOOGLE_CLOUD_PROJECT' | 'GCS_BUCKET_NAME'>>,
): IStorageService {
  if (!env.GCS_BUCKET_NAME) {
    throw new Error('GCS_BUCKET_NAME is required when no storage service override is provided.');
  }

  return new GoogleCloudStorageService({
    bucketName: env.GCS_BUCKET_NAME,
    projectId: env.GOOGLE_CLOUD_PROJECT,
  });
}

function createAnalysisService(
  env: Partial<Pick<AppEnv, 'GOOGLE_CLOUD_PROJECT' | 'GOOGLE_GENAI_LOCATION' | 'GEMINI_MODEL'>>,
  storageService: IStorageService,
): AnalysisService | undefined {
  if (!env.GOOGLE_CLOUD_PROJECT || !env.GOOGLE_GENAI_LOCATION) {
    return undefined;
  }

  const geminiService = new GeminiService({
    projectId: env.GOOGLE_CLOUD_PROJECT,
    location: env.GOOGLE_GENAI_LOCATION,
    modelName: env.GEMINI_MODEL || 'gemini-3.8-flash',
  });

  return new AnalysisService(storageService, geminiService);
}

