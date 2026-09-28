export function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <path
        d="M5 12h14m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
      <path
        d="M12 15V4m0 0L8 8m4-4 4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M6 7v12h12V7M3 4h18v3H3V4Zm6 7h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 3.5c.5 4.7 3.8 7.9 8.5 8.5-4.7.5-8 3.8-8.5 8.5-.5-4.7-3.8-8-8.5-8.5 4.7-.6 8-3.8 8.5-8.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BoardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
      <rect x="3.5" y="4" width="17" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 4v16m6-16v16" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function FaceIcon({ mood }: { mood: 'happy' | 'sad' }) {
  return (
    <svg viewBox="0 0 32 32" className="size-8" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.7" />
      <path d="M11.5 12.5h.01M20.5 12.5h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d={
          mood === 'happy'
            ? 'M10.5 18c1.2 2.4 3 3.5 5.5 3.5s4.3-1.1 5.5-3.5'
            : 'M10.5 22c1.2-2.4 3-3.5 5.5-3.5s4.3 1.1 5.5 3.5'
        }
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ThumbsUpIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-8" fill="none" aria-hidden="true">
      <path
        d="M11 14.5 15.5 7c.5-.8 1.6-1 2.3-.4.6.5.8 1.2.6 2l-1.1 4.1h5.8c1.8 0 3.1 1.7 2.6 3.4l-2.2 7.5c-.3 1.2-1.4 2-2.6 2H11m0-11.1v11.1H6.5V14.5H11Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronLeftIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
