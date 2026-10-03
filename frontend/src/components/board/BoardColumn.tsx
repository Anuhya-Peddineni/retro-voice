import type React from 'react';
import type { ColumnKey, FeedbackItem } from '../../types/api';
import { Button, Heading } from '../common/UI';
import { PlusIcon } from '../common/Icons';
import { FeedbackCard, type AnalysisCardStatus } from './FeedbackCard';

export function BoardColumn({
  type,
  title,
  icon,
  generatedItems = [],
  manualItems = [],
  analysisCardStatus = {},
  onAcceptAnalysisCard,
  onRejectAnalysisCard,
  onEditAnalysisCard,
  onEditManualItem,
  onDeleteManualItem,
  onOpenComposer,
}: {
  type: ColumnKey;
  title: string;
  icon: React.ReactNode;
  generatedItems?: FeedbackItem[];
  manualItems?: FeedbackItem[];
  analysisCardStatus?: Record<string, AnalysisCardStatus>;
  onAcceptAnalysisCard?: (id: string) => void;
  onRejectAnalysisCard?: (id: string) => void;
  onEditAnalysisCard?: (id: string, newText: string) => void;
  onEditManualItem?: (id: string, newText: string) => void;
  onDeleteManualItem?: (id: string) => void;
  onOpenComposer: () => void;
}) {
  const accent =
    type === 'well'
      ? 'text-emerald-600 bg-emerald-50'
      : type === 'improve'
      ? 'text-rose-600 bg-rose-50'
      : 'text-blue-600 bg-blue-50';

  // Accepted = visible as normal card; Rejected = hidden; Pending = show with Accept/Reject
  const visibleGeneratedItems = generatedItems.filter(
    (item) => (analysisCardStatus[item.id ?? item.text] ?? 'pending') !== 'rejected',
  );

  const totalCount = visibleGeneratedItems.length + manualItems.length;

  return (
    <section className="flex min-h-96 flex-col rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <span className={`flex size-11 items-center justify-center rounded-xl ${accent}`}>{icon}</span>
        <div>
          <Heading level={2} className="text-base font-semibold text-slate-950">
            {title}
          </Heading>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            {totalCount} item{totalCount === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Add new feedback at the TOP, below the header */}
      <Button
        onClick={onOpenComposer}
        className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
      >
        <PlusIcon />
        Add new feedback
      </Button>

      <div className="mt-3 flex flex-1 flex-col gap-3">
        {/* AI-generated items */}
        {visibleGeneratedItems.map((item, idx) => {
          const itemId = item.id ?? `${item.author}-${idx}-${item.text}`;
          const status = analysisCardStatus[itemId] ?? 'pending';
          const isAccepted = status === 'accepted';

          return (
            <FeedbackCard
              key={itemId}
              item={item}
              isAnalysis={!isAccepted}
              status={status}
              onAccept={() => onAcceptAnalysisCard?.(itemId)}
              onReject={() => onRejectAnalysisCard?.(itemId)}
              onEdit={(newText) => onEditAnalysisCard?.(itemId, newText)}
              onDelete={() => onRejectAnalysisCard?.(itemId)}
            />
          );
        })}

        {/* Manual items */}
        {manualItems.map((item, idx) => {
          const itemId = item.id ?? `manual-${item.author}-${idx}-${item.text}`;
          return (
            <FeedbackCard
              key={itemId}
              item={item}
              onEdit={(newText) => onEditManualItem?.(itemId, newText)}
              onDelete={() => onDeleteManualItem?.(itemId)}
            />
          );
        })}
      </div>
    </section>
  );
}
