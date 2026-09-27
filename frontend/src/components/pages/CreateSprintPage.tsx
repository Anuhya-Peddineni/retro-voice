import { useRef, useState, type ChangeEvent } from 'react';
import type { TranscriptSource } from '../../types/api';
import { Button, Heading, Select, TextInput } from '../common/UI';
import { ArchiveIcon, UploadIcon } from '../common/Icons';
import { normalizeSprintName, validateSelectedFiles, validateSprintNameInput } from '../../lib/validation';

interface CreateSprintPageProps {
  existingSprints: string[];
  onCreated: (sprintName: string) => void;
  onUploadAndCreate: (sprintName: string, files: File[]) => Promise<void>;
  submitting: boolean;
}

export function CreateSprintPage({
  existingSprints,
  onCreated,
  onUploadAndCreate,
  submitting,
}: CreateSprintPageProps) {
  const [name, setName] = useState('');
  const [selectedExistingSprint, setSelectedExistingSprint] = useState(existingSprints[0] || '');
  const [source, setSource] = useState<TranscriptSource | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (source === 'existing') {
      const targetSprint = name.trim() || selectedExistingSprint;
      if (!targetSprint) {
        setErrorMessage('Please select or specify a sprint.');
        return;
      }
      onCreated(targetSprint);
      return;
    }

    if (source === 'upload') {
      const nameError = validateSprintNameInput(name);
      if (nameError) {
        setErrorMessage(nameError);
        return;
      }

      const fileError = validateSelectedFiles(files);
      if (fileError) {
        setErrorMessage(fileError);
        return;
      }

      try {
        const normalized = normalizeSprintName(name);
        await onUploadAndCreate(normalized, files);
        onCreated(normalized);
      } catch (err: unknown) {
        const msg = err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : 'Failed to create sprint with transcripts.';
        setErrorMessage(msg);
      }
    }
  };

  const openFilePicker = () => {
    setSource('upload');
    fileInputRef.current?.click();
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
              setName(event.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="e.g. Mobile checkout — Sprint 24"
            className="mt-2"
          />
        </label>

        <fieldset className="mt-8">
          <legend className="text-sm font-semibold text-slate-800">Choose transcript source</legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Button
              onClick={() => {
                setSource('existing');
                setErrorMessage(null);
                if (!name && selectedExistingSprint) {
                  setName(selectedExistingSprint);
                }
              }}
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
                Choose transcripts already available to your workspace.
              </span>
            </Button>

            <Button
              onClick={() => {
                setErrorMessage(null);
                openFilePicker();
              }}
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
                Select multiple transcript files from your device.
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
              setErrorMessage(null);
              event.currentTarget.value = '';
            }}
          />
        </fieldset>

        {source === 'existing' && existingSprints.length > 0 && (
          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50/60 p-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-900">
                Available Sprints in Workspace
              </span>
              <Select
                value={selectedExistingSprint}
                onChange={(e) => {
                  setSelectedExistingSprint(e.target.value);
                  setName(e.target.value);
                }}
                className="mt-2"
              >
                {existingSprints.map((sprint) => (
                  <option key={sprint} value={sprint}>
                    {sprint}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        )}

        {source === 'upload' && (
          <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">
                {files.length > 0
                  ? `${files.length} transcript ${files.length === 1 ? 'file' : 'files'} selected`
                  : 'Choose transcript files (.txt or .vtt)'}
              </p>
              <Button
                onClick={() => {
                  setErrorMessage(null);
                  openFilePicker();
                }}
                className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                <UploadIcon />
                {files.length > 0 ? 'Upload more' : 'Choose files'}
              </Button>
            </div>
            {files.length > 0 && (
              <ul className="mt-3 divide-y divide-indigo-200/70 border-t border-indigo-200/70">
                {files.map((file, index) => (
                  <li key={`${file.name}-${file.lastModified}-${index}`} className="flex min-w-0 items-center gap-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-indigo-950">{file.name}</span>
                    <Button
                      onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
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

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errorMessage}
          </div>
        )}

        {source && (
          <div className="mt-8 flex justify-end border-t border-slate-200 pt-6">
            <Button
              onClick={() => void handleSubmit()}
              disabled={
                submitting ||
                (source === 'upload' && files.length === 0) ||
                (source === 'existing' && !name.trim() && !selectedExistingSprint)
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white shadow-sm hover:bg-blue-700"
            >
              {submitting ? 'Creating Sprint…' : 'Create Sprint'}
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
