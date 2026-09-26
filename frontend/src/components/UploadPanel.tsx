import type { ChangeEvent } from 'react';

interface UploadPanelProps {
  sprintName: string;
  selectedFiles: File[];
  fileInputKey: string;
  formError?: string;
  submitting: boolean;
  onSprintNameChange: (value: string) => void;
  onFilesChange: (files: File[]) => void;
  onSubmit: () => void;
}

export function UploadPanel({
  sprintName,
  selectedFiles,
  fileInputKey,
  formError,
  submitting,
  onSprintNameChange,
  onFilesChange,
  onSubmit,
}: UploadPanelProps) {
  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    onFilesChange(Array.from(event.target.files || []));
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>Upload transcripts</h2>
          <p>Use .txt or .vtt files for standups, sync notes, or retro transcripts for a sprint.</p>
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Sprint name</span>
          <input
            className="input"
            maxLength={50}
            onChange={(event) => onSprintNameChange(event.target.value)}
            placeholder="e.g. sprint-12"
            type="text"
            value={sprintName}
          />
        </label>

        <label className="field">
          <span>Transcript files</span>
          <input
            accept=".txt,.vtt,text/plain"
            className="input input--file"
            key={fileInputKey}
            multiple
            onChange={handleFileInputChange}
            type="file"
          />
        </label>
      </div>

      {selectedFiles.length > 0 ? (
        <div className="selected-files">
          <strong>Ready to upload</strong>
          <ul>
            {selectedFiles.map((file) => (
              <li key={`${file.name}-${file.size}`}>{file.name} · {formatBytes(file.size)}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {formError ? <p className="inline-error">{formError}</p> : null}

      <div className="actions-row">
        <button className="button" disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? 'Uploading…' : 'Upload transcripts'}
        </button>
        <small>Constraints: up to 10 `.txt` or `.vtt` files, max 2MB each.</small>
      </div>
    </section>
  );
}

function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}


