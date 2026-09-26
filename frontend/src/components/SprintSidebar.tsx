interface SprintSidebarProps {
  sprints: string[];
  selectedSprint: string;
  loading: boolean;
  onRefresh: () => void;
  onSelect: (sprintName: string) => void;
}

export function SprintSidebar({
  sprints,
  selectedSprint,
  loading,
  onRefresh,
  onSelect,
}: SprintSidebarProps) {
  return (
    <aside className="panel panel--sidebar">
      <div className="panel__header">
        <div>
          <h2>Sprints</h2>
          <p>Browse uploaded transcript sets.</p>
        </div>
        <button className="button button--ghost" onClick={onRefresh} disabled={loading} type="button">
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {sprints.length === 0 ? (
        <div className="empty-state">
          <strong>No sprints yet</strong>
          <span>Upload transcripts to create the first sprint.</span>
        </div>
      ) : (
        <ul className="sprint-list">
          {sprints.map((sprint) => {
            const isActive = sprint === selectedSprint;
            return (
              <li key={sprint}>
                <button
                  className={`sprint-list__item${isActive ? ' sprint-list__item--active' : ''}`}
                  onClick={() => onSelect(sprint)}
                  type="button"
                >
                  <span>{sprint}</span>
                  {isActive ? <small>Selected</small> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

