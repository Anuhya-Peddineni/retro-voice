import { useEffect, useState } from 'react';
import type { ColumnKey, FeedbackItem, Page, RetroAnalysisResponse } from './types/api';
import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';
import { HomePage } from './components/pages/HomePage';
import { CreateSprintPage } from './components/pages/CreateSprintPage';
import { BoardPage } from './components/pages/BoardPage';
import { ContactPage } from './components/pages/ContactPage';
import { HelpPage } from './components/pages/HelpPage';
import { analyzeSprint, fetchSprints, uploadSprintTranscripts, getBoardData, saveBoardData, deleteBoardData } from './lib/api';
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
  const [isLoadingBoardData, setIsLoadingBoardData] = useState(false);

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

  // Save state
  const [isSaving, setIsSaving] = useState(false);

  async function saveCurrentBoardData() {
    if (!selectedSprint) return;

    setIsSaving(true);
    try {
      const payload = {
        analysis,
        manualItems: sprintManualItems[selectedSprint] ?? { well: [], improve: [], actions: [] },
        completedActionItems: completedActionItems[selectedSprint] ?? [],
        analysisCardStatus: Object.fromEntries(
          Object.entries(sprintAnalysisCardStatus[selectedSprint] ?? {}).map(([cardId, status]) => [
            cardId,
            status === 'accepted' || status === 'rejected' ? status : 'pending',
          ]),
        ) as Record<string, AnalysisCardStatus>,
      };

      await saveBoardData(selectedSprint, payload);
      showToast('Retro saved.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to save the retro board.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  }

  const handleSaveRetro = saveCurrentBoardData;

  async function clearCurrentBoardData() {
    if (!selectedSprint) return;

    try {
      await deleteBoardData(selectedSprint);
      setAnalysis(null);
      setSprintManualItems((prev) => ({ ...prev, [selectedSprint]: { well: [], improve: [], actions: [] } }));
      setCompletedActionItems((prev) => ({ ...prev, [selectedSprint]: [] }));
      setSprintAnalysisCardStatus((prev) => ({ ...prev, [selectedSprint]: {} }));
      showToast(`Cleared Board for ${selectedSprint}.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to clear saved board data.';
      showToast(msg, 'error');
    }
  }

  useEffect(() => {
    if (!selectedSprint) return;
    void loadBoardData(selectedSprint);
  }, [selectedSprint]);

  useEffect(() => {
    void loadSprints();

    // Save on page unload (safety net)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (selectedSprint && (analysis || Object.keys(sprintManualItems[selectedSprint] || {}).length > 0)) {
        void saveCurrentBoardData();
        // Some browsers require this for unload event
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedSprint, analysis, sprintManualItems]);

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

  async function loadBoardData(sprintName: string) {
    if (!sprintName) return;
    setIsLoadingBoardData(true);
    try {
      const data = await getBoardData(sprintName);

      const normalizedCardStatus = Object.fromEntries(
        Object.entries(data.analysisCardStatus ?? {}).map(([cardId, status]) => [
          cardId,
          status === 'accepted' || status === 'rejected' ? status : 'pending',
        ]),
      ) as Record<string, AnalysisCardStatus>;

      setAnalysis(data.analysis);
      setSprintManualItems((prev: Record<string, Record<ColumnKey, FeedbackItem[]>>) => ({
        ...prev,
        [sprintName]: data.manualItems,
      }));
      setCompletedActionItems((prev: Record<string, string[]>) => ({
        ...prev,
        [sprintName]: data.completedActionItems,
      }));
      setSprintAnalysisCardStatus((prev: Record<string, Record<string, AnalysisCardStatus>>) => ({
        ...prev,
        [sprintName]: normalizedCardStatus,
      }));
    } catch (err) {
      console.error('Failed to load board data:', err);
      // If loading fails, start with empty data
      setAnalysis(null);
      setSprintManualItems((prev: Record<string, Record<ColumnKey, FeedbackItem[]>>) => ({
        ...prev,
        [sprintName]: { well: [], improve: [], actions: [] },
      }));
      setCompletedActionItems((prev: Record<string, string[]>) => ({
        ...prev,
        [sprintName]: [],
      }));
      setSprintAnalysisCardStatus((prev: Record<string, Record<string, AnalysisCardStatus>>) => ({
        ...prev,
        [sprintName]: {},
      }));
    } finally {
      setIsLoadingBoardData(false);
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

      // Immediately save analysis results to Firestore
      const manualItems = sprintManualItems[sprintName] || { well: [], improve: [], actions: [] };
      const actionItems = completedActionItems[sprintName] || [];
      const cardStatus = sprintAnalysisCardStatus[sprintName] || {};

      await saveBoardData(sprintName, {
        analysis: result,
        manualItems,
        completedActionItems: actionItems,
        analysisCardStatus: cardStatus,
      });

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
    setSprintAnalysisCardStatus((prev: Record<string, Record<string, AnalysisCardStatus>>) => {
      const nextStatus = { ...(prev[selectedSprint] || {}), [id]: 'accepted' as const };
      void saveBoardData(selectedSprint, {
        analysis,
        manualItems: sprintManualItems[selectedSprint] ?? { well: [], improve: [], actions: [] },
        completedActionItems: completedActionItems[selectedSprint] ?? [],
        analysisCardStatus: nextStatus,
      });
      return { ...prev, [selectedSprint]: nextStatus };
    });
  }

  function handleRejectAnalysisCard(id: string) {
    if (!selectedSprint) return;
    setSprintAnalysisCardStatus((prev: Record<string, Record<string, AnalysisCardStatus>>) => {
      const nextStatus = { ...(prev[selectedSprint] || {}), [id]: 'rejected' as const };
      void saveBoardData(selectedSprint, {
        analysis,
        manualItems: sprintManualItems[selectedSprint] ?? { well: [], improve: [], actions: [] },
        completedActionItems: completedActionItems[selectedSprint] ?? [],
        analysisCardStatus: nextStatus,
      });
      return { ...prev, [selectedSprint]: nextStatus };
    });
    showToast('Card removed from board.', 'info');
  }

  function handleEditAnalysisCard(id: string, newText: string) {
    if (!analysis) return;
    // We mutate analysis in-place by rebuilding it with updated text
    setAnalysis((prev: RetroAnalysisResponse | null) => {
      if (!prev) return prev;
      const updateInsights = (insights: typeof prev.wentWell) =>
        insights.map((i: any) => (i.id === id ? { ...i, description: newText, title: '' } : i));
      const next = {
        ...prev,
        wentWell: updateInsights(prev.wentWell),
        didntGoWell: updateInsights(prev.didntGoWell),
      };
      void saveBoardData(selectedSprint, {
        analysis: next,
        manualItems: sprintManualItems[selectedSprint] ?? { well: [], improve: [], actions: [] },
        completedActionItems: completedActionItems[selectedSprint] ?? [],
        analysisCardStatus: sprintAnalysisCardStatus[selectedSprint] ?? {},
      });
      return next;
    });
    showToast('Card updated.', 'success');
  }

  // --- Manual item handlers ---
  function handleAddManualItem(column: ColumnKey, item: FeedbackItem) {
    if (!selectedSprint) return;
    setSprintManualItems((prev: Record<string, Record<ColumnKey, FeedbackItem[]>>) => {
      const sprintItems = prev[selectedSprint] || { well: [], improve: [], actions: [] };
      const nextItems = {
        ...prev,
        [selectedSprint]: {
          ...sprintItems,
          [column]: [...sprintItems[column], { ...item, id: item.id ?? crypto.randomUUID() }],
        },
      };
      void saveBoardData(selectedSprint, {
        analysis,
        manualItems: nextItems[selectedSprint],
        completedActionItems: completedActionItems[selectedSprint] ?? [],
        analysisCardStatus: sprintAnalysisCardStatus[selectedSprint] ?? {},
      });
      return nextItems;
    });
    showToast('Feedback added to board.', 'success');
  }

  function handleEditManualItem(column: ColumnKey, id: string, newText: string) {
    if (!selectedSprint) return;
    setSprintManualItems((prev: Record<string, Record<ColumnKey, FeedbackItem[]>>) => {
      const sprintItems = prev[selectedSprint] || { well: [], improve: [], actions: [] };
      const nextItems = {
        ...prev,
        [selectedSprint]: {
          ...sprintItems,
          [column]: sprintItems[column].map((item: FeedbackItem) =>
            item.id === id ? { ...item, text: newText } : item,
          ),
        },
      };
      void saveBoardData(selectedSprint, {
        analysis,
        manualItems: nextItems[selectedSprint],
        completedActionItems: completedActionItems[selectedSprint] ?? [],
        analysisCardStatus: sprintAnalysisCardStatus[selectedSprint] ?? {},
      });
      return nextItems;
    });
    showToast('Card updated.', 'success');
  }

  function handleDeleteManualItem(column: ColumnKey, id: string) {
    if (!selectedSprint) return;
    setSprintManualItems((prev: Record<string, Record<ColumnKey, FeedbackItem[]>>) => {
      const sprintItems = prev[selectedSprint] || { well: [], improve: [], actions: [] };
      const nextItems = {
        ...prev,
        [selectedSprint]: {
          ...sprintItems,
          [column]: sprintItems[column].filter((item: FeedbackItem) => item.id !== id),
        },
      };
      void saveBoardData(selectedSprint, {
        analysis,
        manualItems: nextItems[selectedSprint],
        completedActionItems: completedActionItems[selectedSprint] ?? [],
        analysisCardStatus: sprintAnalysisCardStatus[selectedSprint] ?? {},
      });
      return nextItems;
    });
    showToast('Card deleted.', 'info');
  }

  function handleToggleActionItem(item: FeedbackItem) {
    if (!selectedSprint) return;
    const itemKey = item.id ?? item.text;
    setCompletedActionItems((previous: Record<string, string[]>) => {
      const sprintItems = previous[selectedSprint] ?? [];
      const nextItems = {
        ...previous,
        [selectedSprint]: sprintItems.includes(itemKey)
          ? sprintItems.filter((id: string) => id !== itemKey)
          : [...sprintItems, itemKey],
      };
      void saveBoardData(selectedSprint, {
        analysis,
        manualItems: sprintManualItems[selectedSprint] ?? { well: [], improve: [], actions: [] },
        completedActionItems: nextItems[selectedSprint],
        analysisCardStatus: sprintAnalysisCardStatus[selectedSprint] ?? {},
      });
      return nextItems;
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
              void loadBoardData(sprint);
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
            isLoadingBoardData={isLoadingBoardData}
            onSaveRetro={handleSaveRetro}
            onClearRetro={clearCurrentBoardData}
            isSaving={isSaving}
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
