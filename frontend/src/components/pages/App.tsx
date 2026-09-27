import { useEffect, useState } from 'react';
import type { ColumnKey, FeedbackItem, Page, RetroAnalysisResponse } from '../../types/api';
import { AppHeader } from '../layout/AppHeader';
import { AppFooter } from '../layout/AppFooter';
import { HomePage } from './HomePage';
import { CreateSprintPage } from './CreateSprintPage';
import { BoardPage } from './BoardPage';
import { ContactPage } from './ContactPage';
import { HelpPage } from './HelpPage';
import { analyzeSprint, fetchSprints, uploadSprintTranscripts } from '../../lib/api';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [sprints, setSprints] = useState<string[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<string>('');
  const [analysis, setAnalysis] = useState<RetroAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Manual items stored per sprint
  const [sprintManualItems, setSprintManualItems] = useState<
    Record<string, Record<ColumnKey, FeedbackItem[]>>
  >({});
  const [completedActionItems, setCompletedActionItems] = useState<Record<string, string[]>>({});

  useEffect(() => {
    void loadSprints();
  }, []);

  async function loadSprints(preferredSprint?: string) {
    try {
      const response = await fetchSprints();
      setSprints(response.sprints);
      const nextSprint =
        preferredSprint ||
        (selectedSprint && response.sprints.includes(selectedSprint)
          ? selectedSprint
          : response.sprints[0] || '');
      setSelectedSprint(nextSprint);
    } catch {
      // Fallback if backend is unavailable
      setSprints([]);
    }
  }

  async function handleUploadAndCreate(sprintName: string, files: File[]) {
    setIsUploading(true);
    try {
      const result = await uploadSprintTranscripts(sprintName, files);
      await loadSprints(result.sprintName);
      setSelectedSprint(result.sprintName);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAnalyze(sprintName: string) {
    if (!sprintName) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await analyzeSprint(sprintName);
      setAnalysis(result);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : 'Analysis failed. Please check the backend connection.';
      setAnalysisError(msg);
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleAddManualItem(column: ColumnKey, item: FeedbackItem) {
    if (!selectedSprint) return;
    setSprintManualItems((prev) => {
      const sprintItems = prev[selectedSprint] || { well: [], improve: [], actions: [] };
      return {
        ...prev,
        [selectedSprint]: {
          ...sprintItems,
          [column]: [...sprintItems[column], { ...item, id: item.id ?? crypto.randomUUID() }],
        },
      };
    });
  }

  function handleToggleActionItem(item: FeedbackItem) {
    if (!selectedSprint) return;
    const itemKey = item.id ?? item.text;
    setCompletedActionItems((previous) => {
      const sprintItems = previous[selectedSprint] ?? [];
      return {
        ...previous,
        [selectedSprint]: sprintItems.includes(itemKey)
          ? sprintItems.filter((id) => id !== itemKey)
          : [...sprintItems, itemKey],
      };
    });
  }

  const currentManualItems = (selectedSprint && sprintManualItems[selectedSprint]) || {
    well: [],
    improve: [],
    actions: [],
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader page={page} onNavigate={setPage} />
      <div className="flex-1">
        {page === 'home' && <HomePage onNavigate={setPage} />}
        {page === 'create' && (
          <CreateSprintPage
            existingSprints={sprints}
            onCreated={(sprint: string) => {
              setSelectedSprint(sprint);
              setPage('board');
            }}
            onUploadAndCreate={handleUploadAndCreate}
            submitting={isUploading}
          />
        )}
        {page === 'board' && (
          <BoardPage
            sprints={sprints}
            selectedSprint={selectedSprint}
            onSelectSprint={(sprint: string) => {
              setSelectedSprint(sprint);
              setAnalysisError(null);
            }}
            analysis={analysis}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            manualItems={currentManualItems}
            completedActionItems={completedActionItems[selectedSprint] ?? []}
            onAddManualItem={handleAddManualItem}
            onToggleActionItem={handleToggleActionItem}
            error={analysisError}
          />
        )}
        {page === 'contact' && <ContactPage />}
        {page === 'help' && <HelpPage />}
      </div>
      <AppFooter onNavigate={setPage} />
    </div>
  );
}
