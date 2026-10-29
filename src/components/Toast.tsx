import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const icon =
          t.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : t.type === 'info' ? (
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          );

        const border =
          t.type === 'error'
            ? 'border-rose-500/30'
            : t.type === 'info'
            ? 'border-sky-500/30'
            : 'border-emerald-500/30';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 bg-slate-900/95 backdrop-blur-md rounded-xl border ${border} shadow-2xl flex items-center justify-between gap-3 text-xs text-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {icon}
              <span className="truncate">{t.message}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
