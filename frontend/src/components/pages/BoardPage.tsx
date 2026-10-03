import { useMemo, useState } from 'react';
import type { ColumnKey, FeedbackItem, RetroAnalysisResponse } from '../../types/api';
import { Button, Heading, Select } from '../common/UI';
import { FaceIcon, SparkIcon, ThumbsUpIcon, XIcon } from '../common/Icons';
import { BoardColumn } from '../board/BoardColumn';
import { FeedbackModal } from '../board/FeedbackModal';
import type { AnalysisCardStatus } from '../board/FeedbackCard';

// Save icon
function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="7 3 7 8 15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Trash icon
function TrashBoardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface BoardPageProps {
  sprints: string[];
  selectedSprint: string;
  onSelectSprint: (sprint: string) => void;
  analysis: RetroAnalysisResponse | null;
  onAnalyze: (sprintName: string) => Promise<void>;
  isAnalyzing: boolean;
  manualItems: Record<ColumnKey, FeedbackItem[]>;
  completedActionItems: string[];
  analysisCardStatus: Record<string, AnalysisCardStatus>;
  onAcceptAnalysisCard: (id: string) => void;
  onRejectAnalysisCard: (id: string) => void;
  onEditAnalysisCard: (id: string, newText: string) => void;
  onAddManualItem: (column: ColumnKey, item: FeedbackItem) => void;
  onEditManualItem: (column: ColumnKey, id: string, newText: string) => void;
  onDeleteManualItem: (column: ColumnKey, id: string) => void;
  onToggleActionItem: (item: FeedbackItem) => void;
  onSaveBoard: () => Promise<boolean>;
  onClearBoard: () => Promise<boolean>;
  error?: string | null;
}

export function BoardPage({
  sprints,
  selectedSprint,
  onSelectSprint,
  analysis,
  onAnalyze,
  isAnalyzing,
  manualItems,
  analysisCardStatus,
  onAcceptAnalysisCard,
  onRejectAnalysisCard,
  onEditAnalysisCard,
  onAddManualItem,
  onEditManualItem,
  onDeleteManualItem,
  onSaveBoard,
  onClearBoard,
  error,
}: BoardPageProps) {
  const [openComposer, setOpenComposer] = useState<ColumnKey | null>(null);
  const [dismissedAnalysisKeys, setDismissedAnalysisKeys] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(sessionStorage.getItem('retrovoice:dismissed-analysis') ?? '[]') as string[]);
    } catch {
      return new Set();
    }
  });
  const [confirmationAction, setConfirmationAction] = useState<'save' | 'clear' | null>(null);
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);

  const analyzed = Boolean(analysis && analysis.sprintName === selectedSprint);
  const analysisGeneratedAt = analyzed && analysis ? analysis.summary.generatedAt : undefined;

  const generatedWellItems: FeedbackItem[] = useMemo(() => {
    if (!analyzed || !analysis) return [];
    return analysis.wentWell.map((insight) => ({
      id: insight.id,
      text: `${insight.title}: ${insight.description}`,
      author: 'RetroVoice',
    }));
  }, [analyzed, analysis]);

  const generatedImproveItems: FeedbackItem[] = useMemo(() => {
    if (!analyzed || !analysis) return [];
    return analysis.didntGoWell.map((insight) => ({
      id: insight.id,
      text: `${insight.title}: ${insight.description}`,
      author: 'RetroVoice',
    }));
  }, [analyzed, analysis]);

  const totalInsights = generatedWellItems.length + generatedImproveItems.length;
  const analysisNoticeKey = `${selectedSprint}:${analysisGeneratedAt ?? ''}`;
  const hasPendingInsights = [...generatedWellItems, ...generatedImproveItems].some(
    (item) => (analysisCardStatus[item.id ?? item.text] ?? 'pending') === 'pending',
  );

  const dismissAnalysisNotice = () => {
    setDismissedAnalysisKeys((previous) => {
      const next = new Set(previous);
      next.add(analysisNoticeKey);
      try {
        sessionStorage.setItem('retrovoice:dismissed-analysis', JSON.stringify([...next]));
      } catch {
        // Keep this dismissal for the mounted session if storage is unavailable.
      }
      return next;
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationAction) return;
    setIsConfirmingAction(true);
    try {
      const completed = confirmationAction === 'save' ? await onSaveBoard() : await onClearBoard();
      if (completed) setConfirmationAction(null);
    } finally {
      setIsConfirmingAction(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="block max-w-sm">
            <span className="text-sm font-semibold text-slate-700">Choose existing sprint</span>
            <Select
              value={selectedSprint}
              onChange={(event) => onSelectSprint(event.target.value)}
              className="mt-2"
            >
              {sprints.length > 0 ? (
                sprints.map((sprint) => (
                  <option key={sprint} value={sprint}>
                    {sprint}
                  </option>
                ))
              ) : (
                <option value="">No sprints available</option>
              )}
            </Select>
          </label>
          <Heading level={1} className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Sprint Retrospective Board
          </Heading>
          <p className="mt-3 text-sm text-slate-600">
            Review the sprint together and capture focused follow-up actions.
          </p>
        </div>

        {/* Three equal-width action buttons */}
        <div className="grid shrink-0 grid-cols-3 gap-3">
          <Button
            onClick={() => void onAnalyze(selectedSprint)}
            disabled={isAnalyzing || !selectedSprint}
            className="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <SparkIcon />
            {isAnalyzing ? 'Analyzing…' : 'Analyze Sprint'}
          </Button>
          <Button
            onClick={() => setConfirmationAction('save')}
            disabled={!selectedSprint}
            className="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50"
          >
            <SaveIcon />
            Save Board
          </Button>
          <Button
            onClick={() => setConfirmationAction('clear')}
            disabled={!selectedSprint}
            className="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-600 shadow-sm hover:bg-rose-50"
          >
            <TrashBoardIcon />
            Clear Board
          </Button>
        </div>
      </div>

      {error && (
        <aside className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <div>
            <p className="text-sm font-semibold text-rose-950">Analysis failed</p>
            <p className="mt-1 text-sm leading-6 text-rose-800">{error}</p>
          </div>
        </aside>
      )}

      {analyzed && !error && hasPendingInsights && !dismissedAnalysisKeys.has(analysisNoticeKey) && (
        <aside className="relative mt-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 pr-12">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <SparkIcon />
          </span>
          <div>
            <p className="text-sm font-semibold text-blue-950">RetroVoice analysis complete</p>
            <p className="mt-1 text-sm leading-6 text-blue-800">
              RetroVoice analyzed the sprint transcripts and added {totalInsights} insight
              {totalInsights === 1 ? '' : 's'} to your board. Accept or reject each insight below.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissAnalysisNotice}
            aria-label="Dismiss analysis complete message"
            className="absolute right-3 top-3 rounded-md p-1.5 text-blue-700 hover:bg-blue-100"
          >
            <XIcon className="size-4" />
          </button>
        </aside>
      )}

      <section className="mt-6 grid gap-5 lg:grid-cols-3" aria-label="Retrospective board">
        <BoardColumn
          type="well"
          title="What Went Well"
          icon={<FaceIcon mood="happy" />}
          generatedItems={generatedWellItems}
          manualItems={manualItems.well}
          analysisCardStatus={analysisCardStatus}
          onAcceptAnalysisCard={onAcceptAnalysisCard}
          onRejectAnalysisCard={onRejectAnalysisCard}
          onEditAnalysisCard={onEditAnalysisCard}
          onEditManualItem={(id, text) => onEditManualItem('well', id, text)}
          onDeleteManualItem={(id) => onDeleteManualItem('well', id)}
          onOpenComposer={() => setOpenComposer('well')}
        />
        <BoardColumn
          type="improve"
          title="What Didn't Go Well"
          icon={<FaceIcon mood="sad" />}
          generatedItems={generatedImproveItems}
          manualItems={manualItems.improve}
          analysisCardStatus={analysisCardStatus}
          onAcceptAnalysisCard={onAcceptAnalysisCard}
          onRejectAnalysisCard={onRejectAnalysisCard}
          onEditAnalysisCard={onEditAnalysisCard}
          onEditManualItem={(id, text) => onEditManualItem('improve', id, text)}
          onDeleteManualItem={(id) => onDeleteManualItem('improve', id)}
          onOpenComposer={() => setOpenComposer('improve')}
        />
        <BoardColumn
          type="actions"
          title="Action Items"
          icon={<ThumbsUpIcon />}
          generatedItems={[]}
          manualItems={manualItems.actions}
          onEditManualItem={(id, text) => onEditManualItem('actions', id, text)}
          onDeleteManualItem={(id) => onDeleteManualItem('actions', id)}
          onOpenComposer={() => setOpenComposer('actions')}
        />
      </section>

      {openComposer && (
        <FeedbackModal
          key={openComposer}
          column={openComposer}
          onSave={(item) => {
            onAddManualItem(openComposer, item);
            setOpenComposer(null);
          }}
          onClose={() => setOpenComposer(null)}
        />
      )}

      {confirmationAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="board-confirmation-title"
          aria-describedby="board-confirmation-description"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isConfirmingAction) setConfirmationAction(null);
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 id="board-confirmation-title" className="text-lg font-semibold text-slate-950">
              {confirmationAction === 'save' ? 'Save this sprint?' : 'Clear this sprint?'}
            </h2>
            {confirmationAction === 'clear' ? (
              <p id="board-confirmation-description" className="mt-2 text-sm leading-6 text-slate-600">
                Do you want to clear the current retrospective for {selectedSprint}? This cannot be undone.
              </p>
            ) : (
              <div id="board-confirmation-description" className="mt-4 flex items-start gap-2.5">
                <button
                  type="button"
                  title="Cards added by RetroVoice without a decision will be excluded."
                  aria-label="Cards added by RetroVoice without a decision will be excluded."
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-500"
                >
                  i
                </button>
                <p className="text-xs leading-5 text-slate-500">
                  Do you want to save the current retrospective for {selectedSprint}?
                  <br />
                  <span className="text-[11px]">
                  Cards added by RetroVoice without a decision will be excluded.
                  </span>
                </p>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setConfirmationAction(null)}
                disabled={isConfirmingAction}
                className="rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleConfirmAction()}
                disabled={isConfirmingAction}
                className={`rounded-lg px-4 py-2.5 text-sm text-white ${
                  confirmationAction === 'clear'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isConfirmingAction
                  ? 'Working…'
                  : confirmationAction === 'save'
                  ? 'Save board'
                  : 'Clear board'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
