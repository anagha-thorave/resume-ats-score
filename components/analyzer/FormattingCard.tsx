'use client';

import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormattingFeedbackItem } from '@/lib/types';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface FormattingCardProps {
  feedback: FormattingFeedbackItem[];
}

// ─────────────────────────────────────────────
// Per-type visual config
// ─────────────────────────────────────────────
const typeConfig = {
  success: {
    Icon: CheckCircle2,
    iconClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/8',
    borderClass: 'border-emerald-500/20',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    label: 'Pass',
  },
  warning: {
    Icon: AlertCircle,
    iconClass: 'text-amber-400',
    bgClass: 'bg-amber-500/8',
    borderClass: 'border-amber-500/20',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    label: 'Warning',
  },
  info: {
    Icon: Info,
    iconClass: 'text-[#22D3EE]',
    bgClass: 'bg-[#22D3EE]/8',
    borderClass: 'border-[#22D3EE]/20',
    badgeClass: 'bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/20',
    label: 'Info',
  },
} as const;

// ─────────────────────────────────────────────
// Sub-component: single feedback row
// ─────────────────────────────────────────────
function FeedbackRow({ item }: { item: FormattingFeedbackItem }) {
  const config = typeConfig[item.type];
  const { Icon } = config;

  return (
    <li
      className={cn(
        'flex items-start gap-3 p-3.5 rounded-xl border transition-colors duration-200',
        config.bgClass,
        config.borderClass,
      )}
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0" aria-hidden="true">
        <Icon className={cn('w-4.5 h-4.5', config.iconClass)} strokeWidth={2} />
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-white/90 leading-snug">{item.title}</p>
          {/* Type badge */}
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border',
              config.badgeClass,
            )}
          >
            {config.label}
          </span>
        </div>
        <p className="text-xs text-white/50 mt-1 leading-relaxed">{item.description}</p>
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function FormattingCard({ feedback }: FormattingCardProps) {
  const passCount = feedback.filter((f) => f.type === 'success').length;
  const warnCount = feedback.filter((f) => f.type === 'warning').length;

  return (
    <article className="glass-card rounded-2xl p-5 flex flex-col gap-4" aria-label="Formatting Feedback">
      {/* Header ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white/90">Formatting Feedback</h3>
          <p className="text-xs text-white/40 mt-0.5">ATS Parsability Check</p>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {passCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[11px] font-semibold text-emerald-400">
              <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
              {passCount}
            </span>
          )}
          {warnCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-[11px] font-semibold text-amber-400">
              <AlertCircle className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
              {warnCount}
            </span>
          )}
        </div>
      </div>

      {/* Feedback list ──────────────────────── */}
      {feedback.length === 0 ? (
        <p className="text-sm text-white/30 italic text-center py-4">No formatting feedback available.</p>
      ) : (
        <ul className="flex flex-col gap-2.5" role="list" aria-label="Formatting feedback items">
          {feedback.map((item) => (
            <FeedbackRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </article>
  );
}

export { FormattingCard };
