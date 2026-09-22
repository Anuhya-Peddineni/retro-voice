import { Router } from 'express';
import type { IStorageService } from '../services/storage.service';
import { SprintController } from '../controllers/sprint.controller';
import { uploadFilesMiddleware } from '../middleware/upload.middleware';
import type { AnalysisService } from '../services/analysis.service';

export function createSprintRouter(
  storageService: IStorageService,
  analysisService?: AnalysisService,
): Router {
  const router = Router();
  const controller = new SprintController(storageService, analysisService);

  // List all sprints
  router.get('/', (req, res) => controller.listSprints(req, res));

  // Upload transcripts for a sprint
  router.post('/:sprintName/transcripts', uploadFilesMiddleware, (req, res) =>
    controller.uploadTranscripts(req, res),
  );

  // List transcripts for a sprint
  router.get('/:sprintName/transcripts', (req, res) => controller.listTranscripts(req, res));

  // Analyze sprint
  router.post('/:sprintName/analyze', (req, res) => controller.analyzeSprint(req, res));

  return router;
}

