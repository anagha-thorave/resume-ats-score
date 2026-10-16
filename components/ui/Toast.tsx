'use client';

import React, { useEffect } from 'react';
import { X, Sparkles, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { type Toast } from '@/lib/context';
import { cn } from '@/lib/utils';

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  const icons = {
    info: <Sparkles className="w-4 h-4 shrink-0" />,
    success: <CheckCircle className="w-4 h-4 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 shrink-0" />,
  };

  const styles = {
    info: 'bg-purple-900/60 border-purple-500/40 text-purple-200',
    success: 'bg-emerald-900/60 border-emerald-500/40 text-emerald-200',
    warning: 'bg-amber-900/60 border-amber-500/40 text-amber-200',
    error: 'bg-rose-900/60 border-rose-500/40 text-rose-200',
  };

  return (
    <div
      className={cn(
        'flex items-center space-x-3 px-4 py-3 rounded-2xl border backdrop-blur-md',
        'shadow-xl animate-fade-in min-w-[260px] max-w-sm',
        styles[toast.type],
      )}
      role="alert"
    >
      <span className="shrink-0">{icons[toast.type]}</span>
      <p className="text-xs font-semibold flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-0.5 rounded-lg opacity-60 hover:opacity-100 transition"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col space-y-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
