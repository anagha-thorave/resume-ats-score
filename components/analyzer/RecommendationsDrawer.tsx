'use client';

import React, { useState } from 'react';
import { Sparkles, Check, X, Edit3, ShieldCheck } from 'lucide-react';
import type { RecommendationItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RecommendationsDrawerProps {
  recommendations: RecommendationItem[];
  onApplyRecommendation: (recId: string, action: string, customText?: string) => Promise<void>;
}

export function RecommendationsDrawer({
  recommendations,
  onApplyRecommendation,
}: RecommendationsDrawerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStartEdit = (rec: RecommendationItem) => {
    setEditingId(rec.id);
    setEditText(rec.suggested_text);
  };

  const handleAction = async (recId: string, action: string, customText?: string) => {
    setLoadingId(recId);
    try {
      await onApplyRecommendation(recId, action, customText);
      setEditingId(null);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brandViolet to-brandCyan flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">
              AI Resume Improvement Suggestions
            </h4>
            <p className="text-xs text-slate-400">
              Evidence-based enhancements tailored to the target job description
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Truthfulness Preserved</span>
        </span>
      </div>

      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No recommendations generated. Your resume already aligns strongly with the requirements!
          </div>
        ) : (
          recommendations.map((rec) => {
            const isEditing = editingId === rec.id;
            const isLoading = loadingId === rec.id;
            const isAccepted = rec.status === 'accepted';
            const isRejected = rec.status === 'rejected';

            return (
              <div
                key={rec.id}
                className={cn(
                  'p-4 rounded-xl border transition-all duration-200',
                  isAccepted
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : isRejected
                    ? 'bg-slate-900/20 border-slate-700/30 opacity-60'
                    : 'bg-slate-900/50 border-white/5 hover:border-brandViolet/30',
                )}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-brandViolet/20 text-brandViolet border border-brandViolet/30">
                      {rec.section}
                    </span>
                    <span className="text-xs text-slate-400 font-medium truncate max-w-xs">
                      {rec.target_requirement}
                    </span>
                  </div>

                  {isAccepted ? (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied to Resume</span>
                    </span>
                  ) : isRejected ? (
                    <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
                      <X className="w-3.5 h-3.5" />
                      <span>Dismissed</span>
                    </span>
                  ) : null}
                </div>

                {/* Reason */}
                <p className="text-xs text-brandCyan/90 font-medium mb-3 flex items-start space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brandCyan" />
                  <span>{rec.reason}</span>
                </p>

                {/* Before / After comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Original Text
                    </p>
                    <p className="text-slate-300 leading-relaxed font-sans">{rec.original_text}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-brandViolet/10 border border-brandViolet/20">
                    <p className="text-[10px] font-bold text-brandViolet uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Suggested ATS Rewrite</span>
                    </p>
                    {isEditing ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full text-xs bg-slate-950/80 border border-brandViolet/40 rounded p-2 text-white focus:outline-none focus:border-brandCyan"
                        rows={3}
                      />
                    ) : (
                      <p className="text-slate-100 font-medium leading-relaxed font-sans">
                        {rec.suggested_text}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                {!isAccepted && !isRejected && (
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/5">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleAction(rec.id, 'custom', editText)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brandCyan text-slate-950 hover:bg-cyan-300 transition"
                        >
                          Apply Custom Edit
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleStartEdit(rec)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleAction(rec.id, 'rejected')}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleAction(rec.id, 'accepted')}
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-brandViolet to-brandIndigo text-white hover:opacity-95 shadow-sm transition active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept & Apply</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
