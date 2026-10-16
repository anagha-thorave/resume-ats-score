'use client';

// ============================================================
// JobMatcher — ATS job description input panel
// Allows users to enter/paste a job posting and run matching
// ============================================================

import React, { useState, useRef, useCallback } from 'react';
import {
  Briefcase,
  Building2,
  ClipboardPaste,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JobDescriptionResponse } from '@/lib/types';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

interface JobMatcherProps {
  /** Called when the user submits the form to trigger ATS analysis */
  onAnalyze: (
    jobTitle: string,
    company: string,
    description: string,
  ) => Promise<void>;
  /** Called when the user clicks "Load FinTech Sample Job" */
  onLoadSample: () => Promise<void>;
  /** Currently loaded job description, used to pre-fill fields */
  currentJob?: JobDescriptionResponse | null;
  /** Whether an async operation is in flight */
  loading: boolean;
}

interface FormErrors {
  jobTitle?: string;
  description?: string;
}

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────

const MAX_DESCRIPTION_LENGTH = 8000;
const MIN_DESCRIPTION_LENGTH = 50;

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────

export default function JobMatcher({
  onAnalyze,
  onLoadSample,
  currentJob,
  loading,
}: JobMatcherProps) {
  const [jobTitle, setJobTitle] = useState<string>(currentJob?.title ?? '');
  const [company, setCompany] = useState<string>(
    currentJob?.company_name ?? '',
  );
  const [description, setDescription] = useState<string>(
    currentJob?.description_text ?? '',
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [sampleLoading, setSampleLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ─── Validation ───────────────────────────────────────

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required.';
    }

    if (!description.trim()) {
      newErrors.description = 'Job description is required.';
    } else if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [jobTitle, description]);

  // ─── Handlers ─────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate() || loading) return;
      await onAnalyze(jobTitle.trim(), company.trim(), description.trim());
    },
    [validate, loading, onAnalyze, jobTitle, company, description],
  );

  const handleLoadSample = useCallback(async () => {
    if (loading || sampleLoading) return;
    setSampleLoading(true);
    try {
      await onLoadSample();
    } finally {
      setSampleLoading(false);
    }
  }, [loading, sampleLoading, onLoadSample]);

  const handlePasteFromClipboard = useCallback(async () => {
    setPasteError(null);
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        setPasteError('Clipboard is empty or contains no readable text.');
        return;
      }
      setDescription(text.slice(0, MAX_DESCRIPTION_LENGTH));
      // Clear description error on paste success
      setErrors((prev) => ({ ...prev, description: undefined }));
      textareaRef.current?.focus();
    } catch {
      setPasteError(
        'Could not read clipboard. Please allow clipboard access or paste manually.',
      );
    }
  }, []);

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value.slice(0, MAX_DESCRIPTION_LENGTH);
      setDescription(val);
      if (errors.description && val.trim().length >= MIN_DESCRIPTION_LENGTH) {
        setErrors((prev) => ({ ...prev, description: undefined }));
      }
    },
    [errors.description],
  );

  const handleJobTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setJobTitle(e.target.value);
      if (errors.jobTitle && e.target.value.trim()) {
        setErrors((prev) => ({ ...prev, jobTitle: undefined }));
      }
    },
    [errors.jobTitle],
  );

  const charCount = description.length;
  const charPercent = Math.min((charCount / MAX_DESCRIPTION_LENGTH) * 100, 100);
  const isNearLimit = charCount > MAX_DESCRIPTION_LENGTH * 0.9;
  const isOverLimit = charCount >= MAX_DESCRIPTION_LENGTH;

  // ─── Render ───────────────────────────────────────────

  return (
    <div className="glass-card animate-fade-in rounded-2xl p-6 md:p-8">
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-violet to-brand-indigo shadow-lg shadow-brand-violet/20">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Job Matcher</h2>
            <p className="text-sm text-slate-400">
              Paste a job posting to analyse your ATS fit
            </p>
          </div>
        </div>

        {/* Sample job button */}
        <button
          type="button"
          onClick={handleLoadSample}
          disabled={loading || sampleLoading}
          aria-label="Load a FinTech sample job description"
          className={cn(
            'glass-card-hover flex items-center gap-2 rounded-xl border border-brand-violet/30 px-4 py-2 text-sm font-medium text-brand-violet transition-all duration-200',
            'hover:border-brand-violet/60 hover:bg-brand-violet/10 hover:text-white',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {sampleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Load FinTech Sample Job
        </button>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Row: Job Title + Company */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Job Title */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="job-title"
              className="text-sm font-medium text-slate-300"
            >
              Job Title
              <span className="ml-1 text-rose-400" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="job-title"
              type="text"
              value={jobTitle}
              onChange={handleJobTitleChange}
              placeholder="e.g. Senior Frontend Engineer"
              aria-required="true"
              aria-invalid={!!errors.jobTitle}
              aria-describedby={errors.jobTitle ? 'job-title-error' : undefined}
              disabled={loading}
              className={cn(
                'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none',
                'transition-all duration-200 focus:bg-white/8 focus:ring-2',
                errors.jobTitle
                  ? 'border-rose-500/60 focus:ring-rose-500/30'
                  : 'border-white/10 focus:border-brand-violet/50 focus:ring-brand-violet/20',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            />
            {errors.jobTitle && (
              <p
                id="job-title-error"
                role="alert"
                className="flex items-center gap-1 text-xs text-rose-400"
              >
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {errors.jobTitle}
              </p>
            )}
          </div>

          {/* Company Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="company-name"
              className="text-sm font-medium text-slate-300"
            >
              Company Name
              <span className="ml-1 text-xs text-slate-500">(optional)</span>
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="company-name"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Revolut, Monzo"
                disabled={loading}
                className={cn(
                  'w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none',
                  'transition-all duration-200 focus:border-brand-violet/50 focus:bg-white/8 focus:ring-2 focus:ring-brand-violet/20',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              />
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="job-description"
              className="text-sm font-medium text-slate-300"
            >
              Job Description
              <span className="ml-1 text-rose-400" aria-hidden="true">
                *
              </span>
            </label>

            {/* Paste from clipboard */}
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              disabled={loading}
              aria-label="Paste job description from clipboard"
              className={cn(
                'flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-400',
                'transition-all duration-200 hover:border-brand-cyan/40 hover:bg-brand-cyan/10 hover:text-brand-cyan',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              Paste from clipboard
            </button>
          </div>

          <div className="relative">
            <textarea
              id="job-description"
              ref={textareaRef}
              value={description}
              onChange={handleDescriptionChange}
              rows={7}
              placeholder="Paste the full job description here — requirements, responsibilities, qualifications…"
              aria-required="true"
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? 'desc-error' : 'desc-counter'
              }
              disabled={loading}
              className={cn(
                'w-full resize-none rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none',
                'transition-all duration-200 focus:bg-white/8 focus:ring-2',
                errors.description
                  ? 'border-rose-500/60 focus:ring-rose-500/30'
                  : 'border-white/10 focus:border-brand-violet/50 focus:ring-brand-violet/20',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            />
          </div>

          {/* Character counter + progress bar */}
          <div className="flex flex-col gap-1.5">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div
                role="progressbar"
                aria-valuenow={charCount}
                aria-valuemax={MAX_DESCRIPTION_LENGTH}
                aria-label="Description character usage"
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isOverLimit
                    ? 'bg-rose-500'
                    : isNearLimit
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-brand-violet to-brand-cyan',
                )}
                style={{ width: `${charPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              {errors.description ? (
                <p
                  id="desc-error"
                  role="alert"
                  className="flex items-center gap-1 text-xs text-rose-400"
                >
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.description}
                </p>
              ) : (
                <span className="text-xs text-slate-500" />
              )}
              <span
                id="desc-counter"
                className={cn(
                  'ml-auto text-xs tabular-nums',
                  isOverLimit
                    ? 'text-rose-400'
                    : isNearLimit
                      ? 'text-amber-400'
                      : 'text-slate-500',
                )}
              >
                {charCount.toLocaleString()} / {MAX_DESCRIPTION_LENGTH.toLocaleString()}
              </span>
            </div>

            {/* Paste error */}
            {pasteError && (
              <p
                role="alert"
                className="flex items-center gap-1 text-xs text-amber-400"
              >
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {pasteError}
              </p>
            )}
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading}
          aria-label="Analyze ATS match and generate career insights"
          className={cn(
            'group relative w-full overflow-hidden rounded-xl px-6 py-3.5 text-sm font-semibold text-white',
            'bg-gradient-to-r from-brand-violet via-brand-indigo to-brand-cyan',
            'shadow-lg shadow-brand-violet/25 transition-all duration-300',
            'hover:shadow-xl hover:shadow-brand-violet/40 hover:brightness-110',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:ring-offset-midnight',
            'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100',
          )}
        >
          {/* Shimmer overlay */}
          <span
            aria-hidden="true"
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />

          <span className="relative flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing…
              </>
            ) : (
              <>
                Analyze ATS Match &amp; Generate Insights
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </span>
        </button>
      </form>
    </div>
  );
}

export { JobMatcher };
