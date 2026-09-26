export interface ApiErrorShape {
  error: {
    code: string;
    message: string;
  };
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface TranscriptFileMeta {
  fileName: string;
  path: string;
  size: number;
}

export interface SprintListResult {
  sprints: string[];
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

export interface RetroInsight {
  id: string;
  title: string;
  description: string;
  evidenceCount: number;
  evidence?: string[];
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

export interface AppError {
  code: string;
  message: string;
}

