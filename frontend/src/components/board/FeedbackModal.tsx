import { useState } from 'react';
import type { ColumnKey, FeedbackItem } from '../../types/api';
import { Button, Heading, TextArea, TextInput } from '../common/UI';

export function FeedbackModal({
  column,
  onSave,
  onClose,
}: {
  column: ColumnKey;
  onSave: (item: FeedbackItem) => void;
  onClose: () => void;
}) {
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-7">
        <div>
          <Heading level={2} className="text-xl font-semibold text-slate-950">
            <span id="feedback-modal-title">{column === 'actions' ? 'Add action item' : 'Add feedback'}</span>
          </Heading>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Share your feedback with the team and add your name so everyone knows who contributed it.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              {column === 'actions' ? 'Action item' : 'Feedback'}
            </span>
            <TextArea
              autoFocus
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder={column === 'actions' ? 'Describe the next step for the team' : 'Share your feedback'}
              className="mt-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Your name</span>
            <TextInput
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              className="mt-2"
            />
          </label>
        </div>

        <div className="mt-7 flex justify-end gap-3 border-t border-slate-200 pt-5">
          <Button onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100">
            Cancel
          </Button>
          <Button
            onClick={() => onSave({ text: feedback.trim(), author: name.trim() })}
            disabled={!feedback.trim() || !name.trim()}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white shadow-sm hover:bg-blue-700"
          >
            Save feedback
          </Button>
        </div>
      </div>
    </div>
  );
}
