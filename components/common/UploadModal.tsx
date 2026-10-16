'use client';

import React, { useRef, useState } from 'react';
import { AlertCircle, FileText, Sparkles, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ResumeIntakeAnswers {
  jobTitle: string;
  yearsExperience: number;
  keySkills: string;
  jobDescription: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile: (file: File, answers: ResumeIntakeAnswers) => Promise<void>;
  onLoadSample: () => Promise<void>;
  loading: boolean;
}

export function UploadModal({ isOpen, onClose, onUploadFile, onLoadSample, loading }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [keySkills, setKeySkills] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setSelectedFile(null);
    setJobTitle('');
    setYearsExperience('');
    setKeySkills('');
    setJobDescription('');
    setError(null);
    onClose();
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF (.pdf) file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please select a smaller file.');
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleAnalyze = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile || loading) return;
    setError(null);
    try {
      await onUploadFile(selectedFile, {
        jobTitle: jobTitle.trim(),
        yearsExperience: Number(yearsExperience),
        keySkills: keySkills.trim(),
        jobDescription: jobDescription.trim(),
      });
      resetAndClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    }
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) resetAndClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Upload resume and target role details"
    >
      <div className="glass-card max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl border border-purple-500/30 p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/20 text-purple-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Analyze a Resume PDF</h3>
              <p className="text-xs text-slate-400">Text-based PDF, up to 10MB</p>
            </div>
          </div>
          <button type="button" onClick={resetAndClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white" aria-label="Close upload dialog">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div
          onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
          onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => !loading && inputRef.current?.click()}
          className={cn(
            'cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors',
            dragActive ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/15 bg-slate-950/40 hover:border-purple-500/50',
            loading && 'cursor-not-allowed opacity-60',
          )}
          role="button"
          tabIndex={0}
          aria-label="Choose or drop a resume PDF"
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              if (!loading) inputRef.current?.click();
            }
          }}
        >
          {loading ? (
            <p className="text-sm font-semibold text-cyan-300">Extracting text and calculating your ATS match...</p>
          ) : selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-emerald-400" />
              <div className="text-left">
                <p className="max-w-sm truncate text-sm font-semibold text-white">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">PDF selected. Click to choose another.</p>
              </div>
            </div>
          ) : (
            <>
              <UploadCloud className="mx-auto mb-2 h-9 w-9 text-purple-400" />
              <p className="text-sm font-semibold text-white">Choose or drop your resume PDF</p>
              <p className="mt-1 text-xs text-slate-400">We score the text extracted from this file, not a sample resume.</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) processFile(file);
              event.target.value = '';
            }}
            className="hidden"
            aria-hidden="true"
          />
        </div>

        {selectedFile && (
          <form onSubmit={handleAnalyze} className="space-y-4 border-t border-white/10 pt-5">
            <div>
              <h4 className="text-sm font-bold text-white">Your target role</h4>
              <p className="text-xs text-slate-400">These answers personalize the ATS score and keyword gaps.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs text-slate-300">
                <span>1. What job title are you applying for?</span>
                <input required maxLength={100} value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder="e.g. Product Designer" className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" />
              </label>
              <label className="space-y-1.5 text-xs text-slate-300">
                <span>2. How many years of relevant experience do you have?</span>
                <input required type="number" min="0" max="60" step="0.5" value={yearsExperience} onChange={(event) => setYearsExperience(event.target.value)} placeholder="e.g. 4" className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" />
              </label>
              <label className="space-y-1.5 text-xs text-slate-300 sm:col-span-2">
                <span>3. Which key skills does the role require?</span>
                <input required maxLength={500} value={keySkills} onChange={(event) => setKeySkills(event.target.value)} placeholder="e.g. Figma, user research, prototyping" className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" />
              </label>
              <label className="space-y-1.5 text-xs text-slate-300 sm:col-span-2">
                <span>4. Paste the job description (optional, improves matching)</span>
                <textarea maxLength={8000} rows={4} value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the job posting to compare its requirements with your resume." className="w-full resize-y rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" />
              </label>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50">
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-[11px] text-slate-500">Scanned image-only PDFs are not supported; the file must contain selectable text.</p>

        {!selectedFile && (
          <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs">
            <span className="text-slate-400">Don&apos;t have a resume handy?</span>
            <button type="button" disabled={loading} onClick={async () => { await onLoadSample(); resetAndClose(); }} className="flex items-center gap-1.5 font-semibold text-cyan-400 transition hover:text-cyan-300 disabled:opacity-50">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Load Demo Resume</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
