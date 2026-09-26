import { useEffect, useMemo, useState } from 'react';
import './styles.css';
import { NoticeBanner } from './components/NoticeBanner';
import { RetroBoard } from './components/RetroBoard';
import { SprintSidebar } from './components/SprintSidebar';
import { TranscriptList } from './components/TranscriptList';
import { UploadPanel } from './components/UploadPanel';
import {
  analyzeSprint,
  fetchHealth,
  fetchSprints,
  fetchSprintTranscripts,
  getApiBaseUrl,
  uploadSprintTranscripts,
} from './lib/api';
import { normalizeSprintName, validateSelectedFiles, validateSprintNameInput } from './lib/validation';
import type { RetroAnalysisResponse, TranscriptFileMeta } from './types/api';

export default function App() {
  const [sprints, setSprints] = useState<string[]>([]);
  const [selectedSprint, setSelectedSprint] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptFileMeta[]>([]);
  const [analysis, setAnalysis] = useState<RetroAnalysisResponse | null>(null);
  const [draftSprintName, setDraftSprintName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(() => `file-input-${Date.now()}`);
  const [formError, setFormError] = useState<string>();
  const [banner, setBanner] = useState<{ tone: 'error' | 'success' | 'info'; message: string } | null>(null);
  const [loadingSprints, setLoadingSprints] = useState(true);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [healthLabel, setHealthLabel] = useState('Checking backend…');

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    void initialize();
  }, []);

  async function initialize() {
    await Promise.all([loadSprints(), loadHealth()]);
  }

  async function loadHealth() {
    try {
      const response = await fetchHealth();
      setHealthLabel(`${response.service} · ${response.status}`);
    } catch (error) {
      setHealthLabel(toMessage(error));
    }
  }

  async function loadSprints(preferredSprint?: string) {
    setLoadingSprints(true);

    try {
      const response = await fetchSprints();
      setSprints(response.sprints);

      const nextSelected = preferredSprint || (response.sprints.includes(selectedSprint) ? selectedSprint : response.sprints[0] || '');
      setSelectedSprint(nextSelected);

      if (nextSelected) {
        await loadTranscripts(nextSelected);
      } else {
        setTranscripts([]);
        setAnalysis(null);
      }
    } catch (error) {
      const message = toMessage(error);
      setBanner({ tone: 'error', message: `Could not load sprints: ${message}` });
    } finally {
      setLoadingSprints(false);
    }
  }

  async function loadTranscripts(sprintName: string) {
    setLoadingTranscripts(true);

    try {
      const response = await fetchSprintTranscripts(sprintName);
      setSelectedSprint(response.sprintName);
      setDraftSprintName(response.sprintName);
      setTranscripts(response.files);
      setAnalysis(null);
    } catch (error) {
      const message = toMessage(error);
      setBanner({ tone: 'error', message: `Could not load transcripts: ${message}` });
      setTranscripts([]);
    } finally {
      setLoadingTranscripts(false);
    }
  }

  async function handleSelectSprint(sprintName: string) {
    setSelectedSprint(sprintName);
    await loadTranscripts(sprintName);
  }

  async function handleUpload() {
    const sprintError = validateSprintNameInput(draftSprintName);
    if (sprintError) {
      setFormError(sprintError);
      return;
    }

    const fileError = validateSelectedFiles(selectedFiles);
    if (fileError) {
      setFormError(fileError);
      return;
    }

    setFormError(undefined);
    setBanner(null);
    setUploading(true);

    try {
      const normalizedSprint = normalizeSprintName(draftSprintName);
      const result = await uploadSprintTranscripts(normalizedSprint, selectedFiles);
      setBanner({
        tone: 'success',
        message: `Uploaded ${result.count} file${result.count === 1 ? '' : 's'} to ${result.sprintName}.`,
      });
      setSelectedFiles([]);
      setFileInputKey(`file-input-${Date.now()}`);
      setDraftSprintName(result.sprintName);
      await loadSprints(result.sprintName);
      await loadTranscripts(result.sprintName);
    } catch (error) {
      setBanner({ tone: 'error', message: `Upload failed: ${toMessage(error)}` });
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze() {
    if (!selectedSprint) {
      setBanner({ tone: 'info', message: 'Select a sprint before requesting analysis.' });
      return;
    }

    setBanner(null);
    setAnalyzing(true);

    try {
      const response = await analyzeSprint(selectedSprint);
      setAnalysis(response);
      setBanner({ tone: 'success', message: `Analysis completed for ${response.sprintName}.` });
    } catch (error) {
      setBanner({ tone: 'error', message: `Analysis failed: ${toMessage(error)}` });
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">RetroVoice</p>
          <h1>Transcript-powered retrospectives</h1>
          <p className="hero__copy">
            Upload sprint transcripts, analyze them with Gemini, and review anonymized retro insights in one place.
          </p>
        </div>
        <div className="hero__meta">
          <div className="status-pill">{healthLabel}</div>
          <code>{apiBaseUrl}</code>
        </div>
      </header>

      {banner ? <NoticeBanner message={banner.message} tone={banner.tone} /> : null}

      <main className="layout-grid">
        <SprintSidebar
          loading={loadingSprints}
          onRefresh={() => void loadSprints(selectedSprint)}
          onSelect={(name) => void handleSelectSprint(name)}
          selectedSprint={selectedSprint}
          sprints={sprints}
        />

        <div className="content-stack">
          <UploadPanel
            fileInputKey={fileInputKey}
            formError={formError}
            onFilesChange={(files) => {
              setSelectedFiles(files);
              if (formError) {
                setFormError(undefined);
              }
            }}
            onSprintNameChange={(value) => {
              setDraftSprintName(value);
              if (formError) {
                setFormError(undefined);
              }
            }}
            onSubmit={() => void handleUpload()}
            selectedFiles={selectedFiles}
            sprintName={draftSprintName}
            submitting={uploading}
          />

          <TranscriptList
            analyzing={analyzing}
            files={transcripts}
            loading={loadingTranscripts}
            onAnalyze={() => void handleAnalyze()}
            sprintName={selectedSprint}
          />

          <RetroBoard analysis={analysis} loading={analyzing} />
        </div>
      </main>
    </div>
  );
}

function toMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'Something went wrong.';
}


