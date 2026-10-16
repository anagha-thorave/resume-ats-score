'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle } from 'lucide-react';
import type { CategoryScore } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CategoryBreakdownProps {
  categories: CategoryScore[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="glass-card rounded-2xl p-5 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white tracking-wide">Scoring Rubric & Category Breakdown</h4>
          <p className="text-xs text-slate-400 mt-0.5">Explainable 6-pillar ATS evaluation model</p>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-white/5">
          Weighted to 100%
        </span>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => {
          const isExpanded = expandedId === cat.category_id;
          const scoreColor =
            cat.score >= 80 ? 'text-emerald-400' : cat.score >= 60 ? 'text-cyan-400' : 'text-amber-400';
          const barColor =
            cat.score >= 80
              ? 'bg-emerald-400'
              : cat.score >= 60
              ? 'bg-gradient-to-r from-purple-500 to-cyan-400'
              : 'bg-amber-400';

          return (
            <div
              key={cat.category_id}
              className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleExpand(cat.category_id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand(cat.category_id);
                  }
                }}
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-200">{cat.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-400">Weight: {cat.weight_percentage}%</span>
                      <span className={`text-xs font-bold ${scoreColor}`}>
                        {Math.round(cat.score)}/100
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', barColor)}
                      style={{ width: `${Math.min(100, Math.max(0, cat.score))}%` }}
                    />
                  </div>
                </div>

                <div className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/5 text-xs space-y-2.5 animate-fade-in">
                  <p className="text-slate-300 leading-relaxed">{cat.explanation}</p>

                  {cat.positive_signals && cat.positive_signals.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                        Positive Signals:
                      </p>
                      {cat.positive_signals.map((sig, i) => (
                        <div key={i} className="flex items-center space-x-2 text-slate-300">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{sig}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {cat.warning_signals && cat.warning_signals.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                        Optimization Opportunities:
                      </p>
                      {cat.warning_signals.map((sig, i) => (
                        <div key={i} className="flex items-center space-x-2 text-slate-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{sig}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
