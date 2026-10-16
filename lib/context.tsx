'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  ResumeResponse,
  JobDescriptionResponse,
  AnalysisResponse,
  ComparisonResponse,
  ParsedResumeData,
} from '@/lib/types';

// ─────────────────────────────────────────────────────────
// Toast Notification System
// ─────────────────────────────────────────────────────────
export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

// ─────────────────────────────────────────────────────────
// App Context Shape
// ─────────────────────────────────────────────────────────
interface AppContextValue {
  // State
  activeResume: ResumeResponse | null;
  activeJob: JobDescriptionResponse | null;
  activeAnalysis: AnalysisResponse | null;
  comparisonData: ComparisonResponse | null;
  loading: boolean;
  uploadOpen: boolean;
  toasts: Toast[];

  // Setters
  setActiveResume: (r: ResumeResponse | null) => void;
  setActiveJob: (j: JobDescriptionResponse | null) => void;
  setActiveAnalysis: (a: AnalysisResponse | null) => void;
  setComparisonData: (c: ComparisonResponse | null) => void;
  setLoading: (v: boolean) => void;
  setUploadOpen: (v: boolean) => void;

  // Toast helpers
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeResume, setActiveResume] = useState<ResumeResponse | null>(null);
  const [activeJob, setActiveJob] = useState<JobDescriptionResponse | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResponse | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeResume,
        activeJob,
        activeAnalysis,
        comparisonData,
        loading,
        uploadOpen,
        toasts,
        setActiveResume,
        setActiveJob,
        setActiveAnalysis,
        setComparisonData,
        setLoading,
        setUploadOpen,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside <AppProvider>');
  }
  return ctx;
}
