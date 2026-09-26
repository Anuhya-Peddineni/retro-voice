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

