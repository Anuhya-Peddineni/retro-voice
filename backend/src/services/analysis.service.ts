import type { IStorageService } from './storage.service';
import { GeminiService } from './gemini.service';
import type { RetroAnalysisResponse } from '../types/retro';
import {
  sanitizeAnalysisResponse,
  validateAnalysisResponse,
} from '../validators/analysis.validator';

export class AnalysisService {
  constructor(
    private storageService: IStorageService,
    private geminiService: GeminiService,
  ) {}

  async analyzeSprint(sprintName: string): Promise<RetroAnalysisResponse> {
    // Load all transcripts
    const transcriptData = await this.storageService.readSprintTranscripts(sprintName);
    const { content: transcriptContent, fileCount } = transcriptData;

    // Call Gemini for analysis
    const analysis = sanitizeAnalysisResponse(
      await this.geminiService.generateRetroInsights(transcriptContent),
    );

    // Validate the response
    const validation = validateAnalysisResponse(analysis);
    if (!validation.valid) {
      throw new Error(`Invalid AI response: ${validation.error}`);
    }

    // Build the response
    return {
      sprintName,
      summary: {
        totalFiles: fileCount,
        generatedAt: new Date().toISOString(),
      },
      wentWell: (analysis.wentWell || []).map((insight, idx) => ({
        id: `went-well-${idx + 1}`,
        title: insight.title,
        description: insight.description,
        evidenceCount: insight.evidenceCount || 0,
        evidence: insight.evidence || [],
      })),
      didntGoWell: (analysis.didntGoWell || []).map((insight, idx) => ({
        id: `didnt-go-well-${idx + 1}`,
        title: insight.title,
        description: insight.description,
        evidenceCount: insight.evidenceCount || 0,
        evidence: insight.evidence || [],
      })),
    };
  }
}



