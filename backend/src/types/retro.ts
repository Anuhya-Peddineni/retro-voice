export interface TranscriptFileMeta {
  fileName: string;
  path: string;
  size: number;
}

export interface RetroAnalysisInsight {
  title: string;
  description: string;
  evidenceCount: number;
  evidence?: string[];
}

export interface RetroInsight {
  id: string;
  title: string;
  description: string;
  evidenceCount: number;
  evidence?: string[];
}

export interface RetroAnalysisSchema {
  wentWell: RetroAnalysisInsight[];
  didntGoWell: RetroAnalysisInsight[];
}

export interface RetroAnalysisResponse {
  sprintName: string;
  summary: {
    totalFiles: number;
    generatedAt: string;
  };
  wentWell: RetroInsight[];
  didntGoWell: RetroInsight[];
}

export interface UploadResult {
  sprintName: string;
  uploadedFiles: TranscriptFileMeta[];
  count: number;
}

export interface TranscriptListResult {
  sprintName: string;
  files: TranscriptFileMeta[];
  count: number;
}

export interface SprintListResult {
  sprints: string[];
}

export interface SprintBoardSaveRequest {
  analysis: RetroAnalysisResponse | null;
  manualItems: Record<string, any>;
  completedActionItems: string[];
  analysisCardStatus: Record<string, string>;
}

export interface SprintBoardResponse {
  exists: boolean;
  sprintName: string;
  analysis: RetroAnalysisResponse | null;
  manualItems: Record<string, any>;
  completedActionItems: string[];
  analysisCardStatus: Record<string, string>;
  metadata: {
    lastAnalyzedAt?: string;
    lastModifiedAt: string;
    createdAt: string;
  };
}

