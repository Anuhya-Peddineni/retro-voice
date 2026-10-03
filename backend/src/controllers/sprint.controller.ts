import type { Request, Response } from 'express';
import type { IStorageService } from '../services/storage.service';
import type { AnalysisService } from '../services/analysis.service';
import type { IFirestoreService } from '../services/firestore.service';
import { validateSprintName, normalizeSprintName } from '../validators/sprint.validator';
import { validateUploadedFiles } from '../validators/upload.validator';
import type {
  SprintListResult,
  UploadResult,
  TranscriptListResult,
  SprintBoardSaveRequest,
  SprintBoardResponse,
} from '../types/retro';

export class SprintController {
  constructor(
    private storageService: IStorageService,
    private analysisService?: AnalysisService,
    private firestoreService?: IFirestoreService,
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

   async saveBoardData(req: Request, res: Response): Promise<void> {
     const { sprintName } = req.params as { sprintName: string };
     const body = req.body as SprintBoardSaveRequest;

     if (!this.firestoreService) {
       res.status(503).json({
         error: {
           code: 'FIRESTORE_SERVICE_UNAVAILABLE',
           message: 'Firestore service is not available',
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
       const now = new Date().toISOString();

       const sanitizedAnalysis: any = body.analysis ? {
         ...body.analysis,
         wentWell: body.analysis.wentWell.map(({ id, title, description }) => ({ id, title, description })),
         didntGoWell: body.analysis.didntGoWell.map(({ id, title, description }) => ({ id, title, description })),
       } : null;

       await this.firestoreService.saveBoardData(normalizedSprintName, {
         sprintName: normalizedSprintName,
         analysis: sanitizedAnalysis,
         manualItems: body.manualItems,
         completedActionItems: body.completedActionItems,
         analysisCardStatus: body.analysisCardStatus as Record<string, 'pending' | 'accepted' | 'rejected'>,
         metadata: {
           lastAnalyzedAt: body.analysis?.summary.generatedAt,
           lastModifiedAt: now,
           createdAt: now,
         },
       });

       res.json({ success: true, sprintName: normalizedSprintName });
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Failed to save board data';
       res.status(500).json({
         error: {
           code: 'BOARD_DATA_SAVE_FAILED',
           message,
         },
       });
     }
   }

   async getBoardData(req: Request, res: Response): Promise<void> {
     const { sprintName } = req.params as { sprintName: string };

     if (!this.firestoreService) {
       res.status(503).json({
         error: {
           code: 'FIRESTORE_SERVICE_UNAVAILABLE',
           message: 'Firestore service is not available',
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
       const boardData = await this.firestoreService.getBoardData(normalizedSprintName);

       if (!boardData) {
         res.json({
           sprintName: normalizedSprintName,
           analysis: null,
           manualItems: { well: [], improve: [], actions: [] },
           completedActionItems: [],
           analysisCardStatus: {},
           metadata: {
             lastModifiedAt: new Date().toISOString(),
             createdAt: new Date().toISOString(),
           },
         } as SprintBoardResponse);
         return;
       }

       res.json(boardData as SprintBoardResponse);
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Failed to retrieve board data';
       res.status(500).json({
         error: {
           code: 'BOARD_DATA_RETRIEVAL_FAILED',
           message,
         },
       });
     }
   }

   async deleteBoardData(req: Request, res: Response): Promise<void> {
     const { sprintName } = req.params as { sprintName: string };

     if (!this.firestoreService) {
       res.status(503).json({
         error: {
           code: 'FIRESTORE_SERVICE_UNAVAILABLE',
           message: 'Firestore service is not available',
         },
       });
       return;
     }

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
       await this.firestoreService.deleteBoardData(normalizedSprintName);
       res.json({ success: true, sprintName: normalizedSprintName });
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Failed to delete board data';
       res.status(500).json({
         error: {
           code: 'BOARD_DATA_DELETE_FAILED',
           message,
         },
       });
     }
   }

   async updateBoardData(req: Request, res: Response): Promise<void> {
     const { sprintName } = req.params as { sprintName: string };
     const body = req.body as Partial<SprintBoardSaveRequest>;

     if (!this.firestoreService) {
       res.status(503).json({
         error: {
           code: 'FIRESTORE_SERVICE_UNAVAILABLE',
           message: 'Firestore service is not available',
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
       const sanitizedAnalysis: any = body.analysis ? {
         ...body.analysis,
         wentWell: body.analysis.wentWell.map(({ id, title, description }) => ({ id, title, description })),
         didntGoWell: body.analysis.didntGoWell.map(({ id, title, description }) => ({ id, title, description })),
       } : undefined;

       await this.firestoreService.updateBoardData(normalizedSprintName, {
         analysis: sanitizedAnalysis,
         manualItems: body.manualItems,
         completedActionItems: body.completedActionItems,
         analysisCardStatus: body.analysisCardStatus as Record<string, 'pending' | 'accepted' | 'rejected'>,
       } as any);

       res.json({ success: true, sprintName: normalizedSprintName });
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Failed to update board data';
       res.status(500).json({
         error: {
           code: 'BOARD_DATA_UPDATE_FAILED',
           message,
         },
       });
     }
   }
 }


