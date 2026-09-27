import type { FeedbackItem } from '../../types/api';

export function FeedbackCard({
  item,
  checkable = false,
  checked = false,
  onCheckedChange,
}: {
  item: FeedbackItem;
  checkable?: boolean;
  checked?: boolean;
  onCheckedChange?: () => void;
}) {
  const isRetroVoice = item.author === 'RetroVoice';

  return (
    <article className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${checked ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3">
        {checkable && (
          <input
            type="checkbox"
            checked={checked}
            onChange={onCheckedChange}
            aria-label={`Mark action item ${item.text} as ${checked ? 'incomplete' : 'complete'}`}
            className="mt-1 size-4 shrink-0 cursor-pointer accent-blue-600"
          />
        )}
        <p className={`min-w-0 flex-1 text-sm leading-6 text-slate-700 ${checked ? 'line-through' : ''}`}>
          {item.text}
        </p>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        <span
          className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
            isRetroVoice ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
          }`}
        >
          {item.author.slice(0, 1).toUpperCase()}
        </span>
        <span className="text-xs font-medium text-slate-500">Added by {item.author}</span>
      </div>
    </article>
  );
}
