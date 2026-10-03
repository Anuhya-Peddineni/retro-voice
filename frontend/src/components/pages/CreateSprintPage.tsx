import { useRef, useState, useEffect, type ChangeEvent } from 'react';
import type { TranscriptSource } from '../../types/api';
import { Button, Heading, TextInput } from '../common/UI';
import { ArchiveIcon, UploadIcon, CheckCircleIcon, AlertCircleIcon } from '../common/Icons';
import { normalizeSprintName, validateSelectedFiles, validateSprintNameInput } from '../../lib/validation';
import { fetchSprintTranscripts } from '../../lib/api';
import { useToast } from '../common/Toast';

interface CreateSprintPageProps {
  onCreated: (sprintName: string) => void;
  onUploadAndCreate: (sprintName: string, files: File[]) => Promise<void>;
  submitting: boolean;
}

type ExistingCheckState = 'idle' | 'checking' | 'found' | 'notfound' | 'error';

export function CreateSprintPage({
  onCreated,
  onUploadAndCreate,
  submitting,
}: CreateSprintPageProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [source, setSource] = useState<TranscriptSource | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [existingCheckState, setExistingCheckState] = useState<ExistingCheckState>('idle');
  const [foundCount, setFoundCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When source=existing and name changes, debounce-check transcript existence
  useEffect(() => {
    if (source !== 'existing') return;
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    let isCurrentCheck = true;

    const trimmed = name.trim();
    if (!trimmed || validateSprintNameInput(trimmed)) {
      setExistingCheckState('idle');
      setFoundCount(0);
      return;
    }

    setExistingCheckState('checking');
    const normalized = normalizeSprintName(trimmed);

    checkTimerRef.current = setTimeout(async () => {
      try {
        const result = await fetchSprintTranscripts(normalized);
        if (!isCurrentCheck) return;
        if (result && result.files && result.files.length > 0) {
          setFoundCount(result.files.length);
          setExistingCheckState('found');
        } else {
          setFoundCount(0);
          setExistingCheckState('notfound');
        }
      } catch {
        if (!isCurrentCheck) return;
        setFoundCount(0);
        setExistingCheckState('notfound');
      }
    }, 700);

    return () => {
      isCurrentCheck = false;
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    };
  }, [name, source]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast('Please enter a sprint name.', 'error');
      return;
    }

    if (!source) {
      showToast(
        'Please select a transcript source: "Pull Existing Sprint Transcripts" or "Upload Your Own Transcripts".',
        'error',
      );
      return;
    }

    const nameError = validateSprintNameInput(name);
    if (nameError) {
      showToast(nameError, 'error');
      return;
    }

    const normalized = normalizeSprintName(name);

    if (source === 'existing') {
      if (existingCheckState === 'checking') {
        showToast('Still checking for transcripts, please wait…', 'info');
        return;
      }
      if (existingCheckState === 'notfound' || existingCheckState === 'error') {
        showToast(
          `No transcripts found for sprint "${name.trim()}". Please upload transcripts first.`,
          'error',
        );
        return;
      }
      if (existingCheckState !== 'found') {
        showToast('Please wait while we check for existing transcripts.', 'info');
        return;
      }
      onCreated(normalized);
      return;
    }

    if (source === 'upload') {
      if (files.length === 0) {
        showToast('Please select at least one transcript file (.txt or .vtt) to upload.', 'error');
        return;
      }

      const fileError = validateSelectedFiles(files);
      if (fileError) {
        showToast(fileError, 'error');
        return;
      }

      setIsSubmitting(true);
      try {
        await onUploadAndCreate(normalized, files);
        onCreated(normalized);
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
            ? err.message
            : 'Failed to upload transcripts and create sprint.';
        showToast(msg, 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const openFilePicker = () => {
    setSource('upload');
    fileInputRef.current?.click();
  };

  const handleSelectExisting = () => {
    setSource('existing');
    setExistingCheckState('idle');
    setFoundCount(0);
  };

  return (
    <main className="mx-auto max-w-3xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
      <div>
        <span className="text-sm font-semibold text-blue-700">New sprint</span>
        <Heading level={1} className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Create Sprint
        </Heading>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Give your sprint a name, then choose where RetroVoice should get the transcripts.
        </p>
      </div>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Sprint Name</span>
          <TextInput
            value={name}
            onChange={(event) => {
              const newName = event.target.value;
              setName(newName);
              if (source === 'existing') {
                setExistingCheckState('idle');
                setFoundCount(0);
                // Show toast immediately if name is non-empty but invalid
                if (newName.trim()) {
                  const err = validateSprintNameInput(newName.trim());
                  if (err) showToast(err, 'error');
                }
              }
            }}
            placeholder="e.g. sprint-24"
            className="mt-2"
          />
        </label>

        <fieldset className="mt-8">
          <legend className="text-sm font-semibold text-slate-800">Choose transcript source</legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Button
              onClick={handleSelectExisting}
              aria-pressed={source === 'existing'}
              className={`rounded-xl border p-5 text-left ${
                source === 'existing'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span
                className={`flex size-10 items-center justify-center rounded-lg ${
                  source === 'existing' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <ArchiveIcon />
              </span>
              <span className="mt-4 block text-sm font-semibold text-slate-950">
                Pull Existing Sprint Transcripts
              </span>
              <span className="mt-1.5 block text-sm font-normal leading-5 text-slate-600">
                Pull transcripts already stored for this sprint name.
              </span>
            </Button>

            <Button
              onClick={openFilePicker}
              aria-pressed={source === 'upload'}
              className={`rounded-xl border p-5 text-left ${
                source === 'upload'
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span
                className={`flex size-10 items-center justify-center rounded-lg ${
                  source === 'upload' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <UploadIcon />
              </span>
              <span className="mt-4 block text-sm font-semibold text-slate-950">
                Upload Your Own Transcripts
              </span>
              <span className="mt-1.5 block text-sm font-normal leading-5 text-slate-600">
                Select multiple transcript files (.txt or .vtt) from your device.
              </span>
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.vtt"
            className="sr-only"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setSource('upload');
              const selected = Array.from(event.target.files ?? []);
              setFiles((current) => [...current, ...selected]);
              event.currentTarget.value = '';
            }}
          />
        </fieldset>

        {/* Existing sprint inline status banner */}
        {source === 'existing' && (
          <div className="mt-4">
            {existingCheckState === 'checking' && (
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <svg className="size-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Checking for transcripts in &quot;{normalizeSprintName(name)}&quot;…
              </div>
            )}
            {existingCheckState === 'found' && (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold">
                    Found {foundCount} transcript{foundCount === 1 ? '' : 's'} for &quot;{normalizeSprintName(name)}&quot;
                  </p>
                  <p className="mt-0.5 text-emerald-700">
                    Click &quot;Create Sprint&quot; to open this sprint on the board.
                  </p>
                </div>
              </div>
            )}
            {(existingCheckState === 'notfound' || existingCheckState === 'error') && name.trim().length >= 3 && !validateSprintNameInput(name) && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <AlertCircleIcon className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold">
                    No transcripts found for &quot;{normalizeSprintName(name)}&quot;
                  </p>
                  <p className="mt-0.5 text-amber-700">
                    Please upload transcripts for this sprint first, or choose &quot;Upload Your Own Transcripts&quot;.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload status panel */}
        {source === 'upload' && (
          <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">
                {files.length > 0
                  ? `${files.length} transcript ${files.length === 1 ? 'file' : 'files'} selected`
                  : 'Choose transcript files (.txt or .vtt)'}
              </p>
              <Button
                onClick={openFilePicker}
                className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                <UploadIcon />
                {files.length > 0 ? 'Upload more' : 'Choose files'}
              </Button>
            </div>
            {files.length > 0 && (
              <ul className="mt-3 divide-y divide-indigo-200/70 border-t border-indigo-200/70">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex min-w-0 items-center gap-3 py-2"
                  >
                    <span className="min-w-0 flex-1 truncate text-indigo-950">{file.name}</span>
                    <Button
                      onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                      aria-label={`Remove ${file.name}`}
                      className="flex size-7 shrink-0 items-center justify-center rounded-md text-lg leading-none text-indigo-700 hover:bg-indigo-100"
                    >
                      ×
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Create Sprint button — always visible at bottom */}
        <div className="mt-8 flex justify-end border-t border-slate-200 pt-6">
          <Button
            onClick={() => void handleSubmit()}
            disabled={submitting || isSubmitting || existingCheckState === 'checking'}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white shadow-sm hover:bg-blue-700"
          >
            {submitting || isSubmitting
              ? 'Creating Sprint…'
              : existingCheckState === 'checking'
              ? 'Checking…'
              : 'Create Sprint'}
          </Button>
        </div>
      </section>
    </main>
  );
}
