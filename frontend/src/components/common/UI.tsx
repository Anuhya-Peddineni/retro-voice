import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = '', type = 'button', ...props }: ButtonProps) {
  return React.createElement('button', {
    type,
    className: `cursor-pointer font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`,
    ...props,
  });
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return React.createElement('input', {
    ...props,
    className: `w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${props.className ?? ''}`,
  });
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return React.createElement('textarea', {
    ...props,
    className: `min-h-28 w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${props.className ?? ''}`,
  });
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return React.createElement('select', {
    ...props,
    className: `w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${props.className ?? ''}`,
  });
}

export function Heading({
  level,
  className = '',
  children,
}: {
  level: 1 | 2 | 3;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p role="heading" aria-level={level} className={className}>
      {children}
    </p>
  );
}

export function Logo({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="group flex items-center rounded-lg px-2 py-1.5 text-slate-900"
      aria-label="RetroVoice home"
    >
      <img src="/retrovoice-logo.svg" alt="RetroVoice" className="h-10 w-auto" />
    </Button>
  );
}

