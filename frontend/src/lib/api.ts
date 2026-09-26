import type {
  ApiErrorShape,
  AppError,
  HealthResponse,
  RetroAnalysisResponse,
  SprintListResult,
  TranscriptListResult,
  UploadResult,
} from '../types/api';

const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function normalizeApiError(status: number, payload: unknown): AppError {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const candidate = payload as ApiErrorShape;
    if (candidate.error?.code && candidate.error?.message) {
      return candidate.error;
    }
  }

  return {
    code: status === 0 ? 'NETWORK_ERROR' : 'UNEXPECTED_ERROR',
    message: status === 0
      ? 'Could not reach the backend. Check that the backend is running and CORS is configured.'
      : 'Unexpected server response.',
  };
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw normalizeApiError(0, null);
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw normalizeApiError(response.status, payload);
  }

  return payload as T;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return requestJson<HealthResponse>('/api/health');
}

export async function fetchSprints(): Promise<SprintListResult> {
  return requestJson<SprintListResult>('/api/sprints');
}

export async function fetchSprintTranscripts(sprintName: string): Promise<TranscriptListResult> {
  return requestJson<TranscriptListResult>(`/api/sprints/${encodeURIComponent(sprintName)}/transcripts`);
}

export async function uploadSprintTranscripts(sprintName: string, files: File[]): Promise<UploadResult> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return requestJson<UploadResult>(`/api/sprints/${encodeURIComponent(sprintName)}/transcripts`, {
    method: 'POST',
    body: formData,
  });
}

export async function analyzeSprint(sprintName: string): Promise<RetroAnalysisResponse> {
  return requestJson<RetroAnalysisResponse>(`/api/sprints/${encodeURIComponent(sprintName)}/analyze`, {
    method: 'POST',
  });
}

