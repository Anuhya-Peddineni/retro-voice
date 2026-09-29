import { useState } from 'react';
import type { FeedbackItem } from '../../types/api';
import { XIcon, CheckIcon } from '../common/Icons';
import { Button, TextArea } from '../common/UI';

export type AnalysisCardStatus = 'pending' | 'accepted' | 'rejected';

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" aria-hidden="true">
      <path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EditCardModal({
  item,
  onSave,
  onDelete,
  onClose,
}: {
  item: FeedbackItem;
  onSave: (newText: string) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(item.text);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-card-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p id="edit-card-title" className="text-xl font-semibold text-slate-950">
              Edit card
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Added by{' '}
              <span className="font-medium text-slate-700">
                {item.author === 'RetroVoice' ? 'RetroVoice' : item.author}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="mt-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Content</span>
            <TextArea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-2"
            />
          </label>
        </div>

        {confirmDelete ? (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-900">Delete this card?</p>
            <p className="mt-1 text-sm text-rose-700">This action cannot be undone.</p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Yes, delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <TrashIcon />
              Delete card
            </button>
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                className="rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onSave(text.trim())}
                disabled={!text.trim()}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white shadow-sm hover:bg-blue-700"
              >
                Save changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function FeedbackCard({
  item,
  checkable = false,
  checked = false,
  onCheckedChange,
  isAnalysis = false,
  status = 'pending',
  onAccept,
  onReject,
  onEdit,
  onDelete,
}: {
  item: FeedbackItem;
  checkable?: boolean;
  checked?: boolean;
  onCheckedChange?: () => void;
  isAnalysis?: boolean;
  status?: AnalysisCardStatus;
  onAccept?: () => void;
  onReject?: () => void;
  onEdit?: (newText: string) => void;
  onDelete?: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);

  const isAI = item.author === 'RetroVoice' && isAnalysis;
  const isAccepted = isAI && status === 'accepted';
  const isRejected = isAI && status === 'rejected';

  // Rejected AI cards are hidden from board (caller filters them out)
  // Accepted AI cards look like normal cards
  if (isRejected) return null;

  return (
    <>
      <article
        className={`relative rounded-xl border bg-white p-4 shadow-sm transition-all ${
          isAccepted ? 'border-slate-200' : isAI ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200'
        } ${checked ? 'opacity-70' : ''}`}
      >
        {/* Pencil / edit button — top right of every card */}
        {(onEdit || onDelete) && (
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="absolute right-3 top-3 flex items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Edit card"
          >
            <PencilIcon />
          </button>
        )}

        <div className="flex items-start gap-3 pr-7">
          {checkable && (
            <input
              type="checkbox"
              checked={checked}
              onChange={onCheckedChange}
              aria-label={`Mark action item as ${checked ? 'incomplete' : 'complete'}`}
              className="mt-1 size-4 shrink-0 cursor-pointer accent-blue-600"
            />
          )}
          <p
            className={`min-w-0 flex-1 text-sm leading-6 ${
              checked ? 'line-through text-slate-400' : 'text-slate-800'
            }`}
          >
            {item.text}
          </p>
        </div>

        {/* Footer row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                isAI ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {item.author.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Added by {item.author}
            </span>
          </div>

          {/* Accept / Reject buttons for pending AI cards */}
          {isAI && !isAccepted && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onAccept}
                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
              >
                <CheckIcon className="size-3" />
                Accept
              </button>
              <button
                type="button"
                onClick={onReject}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
              >
                <XIcon className="size-3" />
                Reject
              </button>
            </div>
          )}
        </div>
      </article>

      {editOpen && (
        <EditCardModal
          item={item}
          onSave={(newText) => {
            onEdit?.(newText);
            setEditOpen(false);
          }}
          onDelete={() => {
            onDelete?.();
            setEditOpen(false);
          }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}
