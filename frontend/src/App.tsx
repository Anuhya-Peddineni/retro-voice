import { useEffect, useState } from 'react';
import type { ColumnKey, FeedbackItem, Page, RetroAnalysisResponse } from './types/api';
import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';
import { HomePage } from './components/pages/HomePage';
import { CreateSprintPage } from './components/pages/CreateSprintPage';
import { BoardPage } from './components/pages/BoardPage';
import { ContactPage } from './components/pages/ContactPage';
import { HelpPage } from './components/pages/HelpPage';
import { analyzeSprint, fetchSprints, uploadSprintTranscripts } from './lib/api';
import { ToastProvider, useToast } from './components/common/Toast';
import type { AnalysisCardStatus } from './components/board/FeedbackCard';

function AppContent() {
  const { showToast } = useToast();
  const [page, setPage] = useState<Page>('home');
  const [sprints, setSprints] = useState<string[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<string>('');
  const [analysis, setAnalysis] = useState<RetroAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Manual items per sprint: { sprintName: { well: [], improve: [], actions: [] } }
  const [sprintManualItems, setSprintManualItems] = useState<
    Record<string, Record<ColumnKey, FeedbackItem[]>>
  >({});

  // Completed action items per sprint: { sprintName: [itemId, ...] }
  const [completedActionItems, setCompletedActionItems] = useState<Record<string, string[]>>({});

  // Analysis card accept/reject status per sprint: { sprintName: { cardId: 'pending'|'accepted'|'rejected' } }
  const [sprintAnalysisCardStatus, setSprintAnalysisCardStatus] = useState<
    Record<string, Record<string, AnalysisCardStatus>>
  >({});

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
      showToast(`Analysis complete for ${sprintName}!`, 'success');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : 'Analysis failed. Please check the backend connection.';
      setAnalysisError(msg);
      showToast(msg, 'error');
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  }

  // --- Analysis card handlers ---
  function handleAcceptAnalysisCard(id: string) {
    if (!selectedSprint) return;
    setSprintAnalysisCardStatus((prev) => ({
      ...prev,
      [selectedSprint]: { ...(prev[selectedSprint] || {}), [id]: 'accepted' },
    }));
  }

  function handleRejectAnalysisCard(id: string) {
    if (!selectedSprint) return;
    setSprintAnalysisCardStatus((prev) => ({
      ...prev,
      [selectedSprint]: { ...(prev[selectedSprint] || {}), [id]: 'rejected' },
    }));
    showToast('Card removed from board.', 'info');
  }

  function handleEditAnalysisCard(id: string, newText: string) {
    if (!analysis) return;
    // We mutate analysis in-place by rebuilding it with updated text
    setAnalysis((prev) => {
      if (!prev) return prev;
      const updateInsights = (insights: typeof prev.wentWell) =>
        insights.map((i) => (i.id === id ? { ...i, description: newText, title: '' } : i));
      return {
        ...prev,
        wentWell: updateInsights(prev.wentWell),
        didntGoWell: updateInsights(prev.didntGoWell),
      };
    });
    showToast('Card updated.', 'success');
  }

  // --- Manual item handlers ---
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
    showToast('Feedback added to board.', 'success');
  }

  function handleEditManualItem(column: ColumnKey, id: string, newText: string) {
    if (!selectedSprint) return;
    setSprintManualItems((prev) => {
      const sprintItems = prev[selectedSprint] || { well: [], improve: [], actions: [] };
      return {
        ...prev,
        [selectedSprint]: {
          ...sprintItems,
          [column]: sprintItems[column].map((item) =>
            item.id === id ? { ...item, text: newText } : item,
          ),
        },
      };
    });
    showToast('Card updated.', 'success');
  }

  function handleDeleteManualItem(column: ColumnKey, id: string) {
    if (!selectedSprint) return;
    setSprintManualItems((prev) => {
      const sprintItems = prev[selectedSprint] || { well: [], improve: [], actions: [] };
      return {
        ...prev,
        [selectedSprint]: {
          ...sprintItems,
          [column]: sprintItems[column].filter((item) => item.id !== id),
        },
      };
    });
    showToast('Card deleted.', 'info');
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

  const currentAnalysisCardStatus = (selectedSprint && sprintAnalysisCardStatus[selectedSprint]) || {};

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader page={page} onNavigate={setPage} />
      <div className="flex-1">
        {page === 'home' && <HomePage onNavigate={setPage} />}
        {page === 'create' && (
          <CreateSprintPage
            onCreated={(sprint) => {
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
            onSelectSprint={(sprint) => {
              setSelectedSprint(sprint);
              setAnalysisError(null);
            }}
            analysis={analysis}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            manualItems={currentManualItems}
            completedActionItems={completedActionItems[selectedSprint] ?? []}
            analysisCardStatus={currentAnalysisCardStatus}
            onAcceptAnalysisCard={handleAcceptAnalysisCard}
            onRejectAnalysisCard={handleRejectAnalysisCard}
            onEditAnalysisCard={handleEditAnalysisCard}
            onAddManualItem={handleAddManualItem}
            onEditManualItem={handleEditManualItem}
            onDeleteManualItem={handleDeleteManualItem}
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

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
