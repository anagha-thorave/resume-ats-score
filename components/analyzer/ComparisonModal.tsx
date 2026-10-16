'use client';

import React from 'react';
import { X, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import type { ComparisonResponse } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ComparisonModalProps {
  comparison: ComparisonResponse | null;
  onClose: () => void;
}

export function ComparisonModal({ comparison, onClose }: ComparisonModalProps) {
  if (!comparison) return null;

  const isPositiveDelta = comparison.score_delta >= 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="glass-card rounded-3xl p-6 w-full max-w-2xl space-y-6 border border-brandViolet/30 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brandViolet/20 flex items-center justify-center text-brandViolet border border-brandViolet/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Before & After Optimization</h3>
              <p className="text-xs text-slate-400">ATS score progression and keyword gap resolution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score comparison banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center items-center p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400">Original Baseline</span>
            <div className="text-3xl font-extrabold text-slate-300">
              {Math.round(comparison.original_score)}%
            </div>
            <p className="text-[11px] text-slate-500">{comparison.original_score_label}</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div
              className={cn(
                'inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-extrabold',
                isPositiveDelta
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
              )}
            >
              <span>{isPositiveDelta ? `+${Math.round(comparison.score_delta)}%` : `${Math.round(comparison.score_delta)}%`}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 mt-1" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold text-brandCyan">Optimized Score</span>
            <div className="text-3xl font-extrabold text-brandCyan">
              {Math.round(comparison.updated_score)}%
            </div>
            <p className="text-[11px] text-brandCyan/70">{comparison.updated_score_label}</p>
          </div>
        </div>

        {/* Keyword resolution section */}
        <div className="space-y-4">
          {comparison.newly_matched_keywords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Newly Matched Job Keywords ({comparison.newly_matched_keywords.length})</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {comparison.newly_matched_keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  >
                    +{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {comparison.remaining_missing_keywords.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Remaining Skill Opportunities ({comparison.remaining_missing_keywords.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {comparison.remaining_missing_keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brandViolet text-white hover:bg-violet-600 transition"
          >
            Close & Continue Editing
          </button>
        </div>
      </div>
    </div>
  );
}
