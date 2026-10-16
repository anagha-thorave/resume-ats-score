'use client';

import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface KeywordCardProps {
  matchPercentage: number;
  totalRequired: number;
  matchedCount: number;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function KeywordCard({ matchPercentage, totalRequired, matchedCount }: KeywordCardProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  const clampedPct = Math.min(100, Math.max(0, matchPercentage));

  // Animate the progress bar on mount / when value changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(clampedPct);
    }, 200);
    return () => clearTimeout(timer);
  }, [clampedPct]);

  // Derive text colour for the percentage readout
  const pctColour =
    clampedPct >= 85
      ? 'text-emerald-400'
      : clampedPct >= 70
        ? 'text-[#8B5CF6]'
        : clampedPct >= 50
          ? 'text-amber-400'
          : 'text-rose-400';

  return (
    <article
      className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col gap-4"
      aria-label="Keyword Match Card"
    >
      {/* Header ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Icon */}
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/20"
            aria-hidden="true"
          >
            <Target className="w-4.5 h-4.5 text-[#22D3EE]" strokeWidth={2} />
          </div>

          {/* Title */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 leading-tight">Keyword Match</h3>
            <p className="text-xs text-white/40 mt-0.5">Based on job requirements</p>
          </div>
        </div>

        {/* Percentage readout */}
        <span
          className={cn('text-2xl font-extrabold tabular-nums leading-none', pctColour)}
          aria-label={`${clampedPct}% keyword match`}
        >
          {Math.round(clampedPct)}
          <span className="text-base font-semibold ml-0.5 text-[#22D3EE]">%</span>
        </span>
      </div>

      {/* Progress bar ────────────────────────── */}
      <div
        className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Keyword match progress: ${Math.round(clampedPct)}%`}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${animatedWidth}%`,
            background: 'linear-gradient(90deg, #8B5CF6 0%, #6366F1 50%, #22D3EE 100%)',
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 8px rgba(139,92,246,0.5)',
          }}
        />
      </div>

      {/* Stats row ───────────────────────────── */}
      <div className="flex items-center justify-between">
        {/* Matched */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30"
            aria-hidden="true"
          >
            <span className="text-[10px] font-bold text-[#8B5CF6]">{matchedCount}</span>
          </span>
          <span className="text-xs text-white/50">
            <span className="text-white/80 font-semibold">{matchedCount}</span>{' '}
            keyword{matchedCount !== 1 ? 's' : ''} matched
          </span>
        </div>

        {/* Divider */}
        <span className="w-px h-4 bg-white/10" aria-hidden="true" />

        {/* Total */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/10"
            aria-hidden="true"
          >
            <span className="text-[10px] font-bold text-white/50">{totalRequired}</span>
          </span>
          <span className="text-xs text-white/50">
            <span className="text-white/80 font-semibold">{totalRequired}</span> target keywords
          </span>
        </div>
      </div>
    </article>
  );
}

export { KeywordCard };
