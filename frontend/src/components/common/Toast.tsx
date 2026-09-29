import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircleIcon, CheckCircleIcon, XIcon } from './Icons';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100%-3rem)] pointer-events-none"
        aria-live="polite"
        role="region"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur bg-white/95 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              toast.type === 'error'
                ? 'border-rose-200 border-l-4 border-l-rose-500 text-rose-950'
                : toast.type === 'success'
                ? 'border-emerald-200 border-l-4 border-l-emerald-500 text-emerald-950'
                : toast.type === 'warning'
                ? 'border-amber-200 border-l-4 border-l-amber-500 text-amber-950'
                : 'border-blue-200 border-l-4 border-l-blue-500 text-blue-950'
            }`}
          >
            <span className="shrink-0 mt-0.5">
              {toast.type === 'error' ? (
                <span className="text-rose-600">
                  <AlertCircleIcon className="size-5" />
                </span>
              ) : toast.type === 'success' ? (
                <span className="text-emerald-600">
                  <CheckCircleIcon className="size-5" />
                </span>
              ) : toast.type === 'warning' ? (
                <span className="text-amber-600">
                  <AlertCircleIcon className="size-5" />
                </span>
              ) : (
                <span className="text-blue-600">
                  <AlertCircleIcon className="size-5" />
                </span>
              )}
            </span>
            <p className="min-w-0 flex-1 text-sm font-medium leading-5">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Dismiss notification"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
