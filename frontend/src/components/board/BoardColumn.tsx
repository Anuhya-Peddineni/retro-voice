import React from 'react';
import type { ColumnKey, FeedbackItem } from '../../types/api';
import { Button, Heading } from '../common/UI';
import { PlusIcon } from '../common/Icons';
import { FeedbackCard } from './FeedbackCard';

export function BoardColumn({
  type,
  title,
  icon,
  generatedItems = [],
  manualItems = [],
  completedActionItems = [],
  onToggleActionItem,
  onOpenComposer,
}: {
  type: ColumnKey;
  title: string;
  icon: React.ReactNode;
  generatedItems?: FeedbackItem[];
  manualItems?: FeedbackItem[];
  completedActionItems?: string[];
  onToggleActionItem?: (item: FeedbackItem) => void;
  onOpenComposer: () => void;
}) {
  const accent =
    type === 'well'
      ? 'text-emerald-600 bg-emerald-50'
      : type === 'improve'
      ? 'text-rose-600 bg-rose-50'
      : 'text-blue-600 bg-blue-50';

  const totalCount = generatedItems.length + manualItems.length;

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

      <div className="mt-4 flex flex-1 flex-col gap-3">
        {generatedItems.map((item, idx) => (
          <FeedbackCard
            key={item.id ?? `${item.author}-${idx}-${item.text}`}
            item={item}
            checkable={type === 'actions'}
            checked={completedActionItems.includes(item.id ?? item.text)}
            onCheckedChange={() => onToggleActionItem?.(item)}
          />
        ))}
        {manualItems.map((item, idx) => (
          <FeedbackCard
            key={item.id ?? `manual-${item.author}-${idx}-${item.text}`}
            item={item}
            checkable={type === 'actions'}
            checked={completedActionItems.includes(item.id ?? item.text)}
            onCheckedChange={() => onToggleActionItem?.(item)}
          />
        ))}
      </div>

      <Button
        onClick={onOpenComposer}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        <PlusIcon />
        Add new feedback
      </Button>
    </section>
  );
}

