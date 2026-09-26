import type { TranscriptFileMeta } from '../types/api';

interface TranscriptListProps {
  sprintName: string;
  files: TranscriptFileMeta[];
  loading: boolean;
  onAnalyze: () => void;
  analyzing: boolean;
}

export function TranscriptList({ sprintName, files, loading, onAnalyze, analyzing }: TranscriptListProps) {
  return (
    <section className="panel">
      <div className="panel__header panel__header--stack-mobile">
        <div>
          <h2>Selected sprint</h2>
          <p>{sprintName ? `Transcript files stored for ${sprintName}.` : 'Pick a sprint or upload a new transcript set.'}</p>
        </div>
        <button
          className="button"
          disabled={!sprintName || files.length === 0 || loading || analyzing}
          onClick={onAnalyze}
          type="button"
        >
          {analyzing ? 'Analyzing…' : 'Analyze sprint'}
        </button>
      </div>

      {!sprintName ? (
        <div className="empty-state">
          <strong>No sprint selected</strong>
          <span>Select a sprint from the sidebar or upload files above.</span>
        </div>
      ) : loading ? (
        <div className="empty-state">
          <strong>Loading transcripts…</strong>
        </div>
      ) : files.length === 0 ? (
        <div className="empty-state">
          <strong>No transcript files yet</strong>
          <span>Upload one or more `.txt` files before requesting analysis.</span>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>File</th>
              <th>Path</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.path}>
                <td>{file.fileName}</td>
                <td>{file.path}</td>
                <td>{formatBytes(file.size)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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

