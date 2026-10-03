import { useMemo, useState } from 'react';
import type { ColumnKey, FeedbackItem, RetroAnalysisResponse } from '../../types/api';
import { Button, Heading, Select } from '../common/UI';
import { FaceIcon, SparkIcon, ThumbsUpIcon } from '../common/Icons';
import { BoardColumn } from '../board/BoardColumn';
import { FeedbackModal } from '../board/FeedbackModal';
import type { AnalysisCardStatus } from '../board/FeedbackCard';

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
  error?: string | null;
  isLoadingBoardData?: boolean;
  onSaveRetro?: () => Promise<void>;
  onClearRetro?: () => Promise<void>;
  isSaving?: boolean;
}

export function BoardPage({
  sprints,
  selectedSprint,
  onSelectSprint,
  analysis,
  onAnalyze,
  isAnalyzing,
  manualItems,
  completedActionItems,
  analysisCardStatus,
  onAcceptAnalysisCard,
  onRejectAnalysisCard,
  onEditAnalysisCard,
  onAddManualItem,
  onEditManualItem,
  onDeleteManualItem,
  onToggleActionItem,
  error,
  isLoadingBoardData,
  onSaveRetro,
  onClearRetro,
  isSaving,
}: BoardPageProps) {
  const [openComposer, setOpenComposer] = useState<ColumnKey | null>(null);

  const analyzed = Boolean(analysis && analysis.sprintName === selectedSprint);

  const generatedWellItems: FeedbackItem[] = useMemo(() => {
    if (!analyzed || !analysis) return [];
    return analysis.wentWell.map((insight) => ({
      id: insight.id,
      text: insight.title ? `${insight.title}: ${insight.description}` : insight.description,
      author: 'RetroVoice',
    }));
  }, [analyzed, analysis]);

  const generatedImproveItems: FeedbackItem[] = useMemo(() => {
    if (!analyzed || !analysis) return [];
    return analysis.didntGoWell.map((insight) => ({
      id: insight.id,
      text: insight.title ? `${insight.title}: ${insight.description}` : insight.description,
      author: 'RetroVoice',
    }));
  }, [analyzed, analysis]);

  const totalInsights = generatedWellItems.length + generatedImproveItems.length;

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
        <Button
          onClick={() => void onAnalyze(selectedSprint)}
          disabled={isAnalyzing || !selectedSprint}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white shadow-sm hover:bg-blue-700"
        >
          <SparkIcon />
          {isAnalyzing ? 'Analyzing…' : analyzed ? 'Analyze Again' : 'Analyze Sprint'}
        </Button>
        <Button
          onClick={() => void onSaveRetro?.()}
          disabled={isSaving || !selectedSprint || (!analysis && Object.keys(manualItems).length === 0)}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save Retro'}
        </Button>
        <Button
          onClick={() => void onClearRetro?.()}
          disabled={!selectedSprint}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
        >
          Clear Board
        </Button>
      </div>

      {error && (
        <aside className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <div>
            <p className="text-sm font-semibold text-rose-950">Analysis failed</p>
            <p className="mt-1 text-sm leading-6 text-rose-800">{error}</p>
          </div>
        </aside>
      )}

      {isLoadingBoardData && (
        <aside className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div>
            <p className="text-sm font-semibold text-blue-950">Loading sprint data…</p>
            <p className="mt-1 text-sm leading-6 text-blue-800">Retrieving your retrospective board data from storage.</p>
          </div>
        </aside>
      )}

      {analyzed && !error && (
        <aside className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
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
          completedActionItems={completedActionItems}
          onToggleActionItem={onToggleActionItem}
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
    </main>
  );
}
