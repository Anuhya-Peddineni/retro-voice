import { Router } from 'express';
import type { IStorageService } from '../services/storage.service';
import type { IFirestoreService } from '../services/firestore.service';
import { SprintController } from '../controllers/sprint.controller';
import { uploadFilesMiddleware } from '../middleware/upload.middleware';
import type { AnalysisService } from '../services/analysis.service';

export function createSprintRouter(
  storageService: IStorageService,
  analysisService?: AnalysisService,
  firestoreService?: IFirestoreService,
): Router {
  const router = Router();
  const controller = new SprintController(storageService, analysisService, firestoreService);

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

  // Get board data for a sprint (includes analysis + manual items + card status)
  router.get('/:sprintName/board', (req, res) => controller.getBoardData(req, res));

  // Save board data for a sprint
  router.post('/:sprintName/board', (req, res) => controller.saveBoardData(req, res));

  // Delete board data for a sprint
  router.delete('/:sprintName/board', (req, res) => controller.deleteBoardData(req, res));

  // Update board data for a sprint
  router.put('/:sprintName/board', (req, res) => controller.updateBoardData(req, res));

  return router;
}

