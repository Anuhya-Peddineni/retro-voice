import type { Request, Response } from 'express';
import type { IStorageService } from '../services/storage.service';
import type { AnalysisService } from '../services/analysis.service';
import { validateSprintName, normalizeSprintName } from '../validators/sprint.validator';
import { validateUploadedFiles } from '../validators/upload.validator';
import type {
  SprintListResult,
  UploadResult,
  TranscriptListResult,
} from '../types/retro';

export class SprintController {
  constructor(
    private storageService: IStorageService,
    private analysisService?: AnalysisService,
  ) {}

  async listSprints(req: Request, res: Response): Promise<void> {
    try {
      const sprints = await this.storageService.listSprints();
      const result: SprintListResult = { sprints };
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list sprints';
      res.status(500).json({
        error: {
          code: 'SPRINT_LIST_FAILED',
          message,
        },
      });
    }
  }

  async uploadTranscripts(req: Request, res: Response): Promise<void> {
    const { sprintName } = req.params as { sprintName: string };

    // Validate sprint name
    const validation = validateSprintName(sprintName);
    if (!validation.valid) {
      res.status(400).json({
        error: {
          code: 'INVALID_SPRINT_NAME',
          message: validation.error,
        },
      });
      return;
    }

    // Validate uploaded files
    const uploadValidation = validateUploadedFiles(req.files as Express.Multer.File[] | undefined);
    if (!uploadValidation.valid) {
      res.status(400).json({
        error: {
          code: 'UPLOAD_VALIDATION_FAILED',
          message: uploadValidation.error,
        },
      });
      return;
    }

    try {
      const files = (req.files as Express.Multer.File[]).map((f) => ({
        filename: f.originalname,
        buffer: f.buffer,
      }));

      const normalizedSprintName = normalizeSprintName(sprintName);
      const uploadedFiles = await this.storageService.uploadFiles(normalizedSprintName, files);

      const result: UploadResult = {
        sprintName: normalizedSprintName,
        uploadedFiles,
        count: uploadedFiles.length,
      };

      res.status(200).json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      res.status(500).json({
        error: {
          code: 'UPLOAD_FAILED',
          message,
        },
      });
    }
  }

  async listTranscripts(req: Request, res: Response): Promise<void> {
    const { sprintName } = req.params as { sprintName: string };

    // Validate sprint name
    const validation = validateSprintName(sprintName);
    if (!validation.valid) {
      res.status(400).json({
        error: {
          code: 'INVALID_SPRINT_NAME',
          message: validation.error,
        },
      });
      return;
    }

    try {
      const normalizedSprintName = normalizeSprintName(sprintName);
      const files = await this.storageService.listSprintFiles(normalizedSprintName);

      const result: TranscriptListResult = {
        sprintName: normalizedSprintName,
        files,
        count: files.length,
      };

      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list transcripts';
      res.status(500).json({
        error: {
          code: 'TRANSCRIPT_LIST_FAILED',
          message,
        },
      });
    }
  }

  async analyzeSprint(req: Request, res: Response): Promise<void> {
    const { sprintName } = req.params as { sprintName: string };

    if (!this.analysisService) {
      res.status(503).json({
        error: {
          code: 'ANALYSIS_SERVICE_UNAVAILABLE',
          message: 'Analysis service is not available',
        },
      });
      return;
    }

    // Validate sprint name
    const validation = validateSprintName(sprintName);
    if (!validation.valid) {
      res.status(400).json({
        error: {
          code: 'INVALID_SPRINT_NAME',
          message: validation.error,
        },
      });
      return;
    }

    try {
      const normalizedSprintName = normalizeSprintName(sprintName);
      const analysis = await this.analysisService.analyzeSprint(normalizedSprintName);
      res.json(analysis);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';

      if (message.includes('No transcripts found')) {
        res.status(400).json({
          error: {
            code: 'EMPTY_TRANSCRIPT_SET',
            message: `No transcripts found for sprint: ${sprintName}`,
          },
        });
        return;
      }

      res.status(500).json({
        error: {
          code: 'AI_ANALYSIS_FAILED',
          message,
        },
      });
    }
  }
}


