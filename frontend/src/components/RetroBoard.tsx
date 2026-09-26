import type { RetroAnalysisResponse, RetroInsight } from '../types/api';

interface RetroBoardProps {
  analysis: RetroAnalysisResponse | null;
  loading: boolean;
}

export function RetroBoard({ analysis, loading }: RetroBoardProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>Retro board</h2>
          <p>AI-generated retrospective themes backed by transcript evidence counts.</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <strong>Generating insights…</strong>
          <span>Gemini is reading the uploaded transcripts and building the retro board.</span>
        </div>
      ) : !analysis ? (
        <div className="empty-state">
          <strong>No analysis yet</strong>
          <span>Run analysis for a sprint to populate the board.</span>
        </div>
      ) : (
        <>
          <div className="summary-grid">
            <div className="summary-card">
              <span>Files analyzed</span>
              <strong>{analysis.summary.totalFiles}</strong>
            </div>
            <div className="summary-card">
              <span>Generated</span>
              <strong>{new Date(analysis.summary.generatedAt).toLocaleString()}</strong>
            </div>
            <div className="summary-card">
              <span>Sprint</span>
              <strong>{analysis.sprintName}</strong>
            </div>
          </div>

          <div className="retro-columns">
            <RetroColumn title="Went well" variant="success" insights={analysis.wentWell} />
            <RetroColumn title="Didn’t go well" variant="warning" insights={analysis.didntGoWell} />
          </div>
        </>
      )}
    </section>
  );
}

interface RetroColumnProps {
  title: string;
  variant: 'success' | 'warning';
  insights: RetroInsight[];
}

function RetroColumn({ title, variant, insights }: RetroColumnProps) {
  return (
    <div className={`retro-column retro-column--${variant}`}>
      <div className="retro-column__header">
        <h3>{title}</h3>
        <span>{insights.length} insight{insights.length === 1 ? '' : 's'}</span>
      </div>

      {insights.length === 0 ? (
        <div className="empty-state empty-state--compact">
          <span>No insights returned for this column.</span>
        </div>
      ) : (
        <div className="insight-list">
          {insights.map((insight) => (
            <article className="insight-card" key={insight.id}>
              <div className="insight-card__title-row">
                <h4>{insight.title}</h4>
                <span>{insight.evidenceCount} mention{insight.evidenceCount === 1 ? '' : 's'}</span>
              </div>
              <p>{insight.description}</p>
              {insight.evidence && insight.evidence.length > 0 ? (
                <ul>
                  {insight.evidence.map((entry, index) => (
                    <li key={`${insight.id}-${index}`}>{entry}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

