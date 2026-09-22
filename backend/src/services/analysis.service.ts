import type { IStorageService } from './storage.service';
import { GeminiService } from './gemini.service';
import type { RetroAnalysisSchema, RetroAnalysisResponse } from '../types/retro';

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
    const analysis = await this.geminiService.generateRetroInsights(transcriptContent);

    // Validate the response
    this.validateAnalysisResponse(analysis);

    // Build the response
    const response: RetroAnalysisResponse = {
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

    return response;
  }

  private validateAnalysisResponse(analysis: Partial<RetroAnalysisSchema>): void {
    if (!analysis.wentWell || !Array.isArray(analysis.wentWell)) {
      analysis.wentWell = [];
    }
    if (!analysis.didntGoWell || !Array.isArray(analysis.didntGoWell)) {
      analysis.didntGoWell = [];
    }

    // Validate individual insights
    for (const insight of analysis.wentWell) {
      if (!insight.title || typeof insight.title !== 'string') {
        throw new Error('Invalid wentWell insight: missing or invalid title');
      }
      if (!insight.description || typeof insight.description !== 'string') {
        throw new Error('Invalid wentWell insight: missing or invalid description');
      }
      if (typeof insight.evidenceCount !== 'number' || insight.evidenceCount < 0) {
        insight.evidenceCount = 1;
      }
      if (!Array.isArray(insight.evidence)) {
        insight.evidence = [];
      }
    }

    for (const insight of analysis.didntGoWell) {
      if (!insight.title || typeof insight.title !== 'string') {
        throw new Error('Invalid didntGoWell insight: missing or invalid title');
      }
      if (!insight.description || typeof insight.description !== 'string') {
        throw new Error('Invalid didntGoWell insight: missing or invalid description');
      }
      if (typeof insight.evidenceCount !== 'number' || insight.evidenceCount < 0) {
        insight.evidenceCount = 1;
      }
      if (!Array.isArray(insight.evidence)) {
        insight.evidence = [];
      }
    }
  }
}



