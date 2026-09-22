import { Router } from 'express';
import type { IStorageService } from '../services/storage.service';
import { SprintController } from '../controllers/sprint.controller';
import { uploadFilesMiddleware } from '../middleware/upload.middleware';

export function createSprintRouter(storageService: IStorageService): Router {
  const router = Router();
  const controller = new SprintController(storageService);

  // List all sprints
  router.get('/', (req, res) => controller.listSprints(req, res));

  // Upload transcripts for a sprint
  router.post('/:sprintName/transcripts', uploadFilesMiddleware, (req, res) =>
    controller.uploadTranscripts(req, res),
  );

  // List transcripts for a sprint
  router.get('/:sprintName/transcripts', (req, res) => controller.listTranscripts(req, res));

  return router;
}

