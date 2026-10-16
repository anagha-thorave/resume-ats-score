'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ScoreGaugeProps {
  score: number;
  label?: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getBadgeStyle(score: number): { bg: string; text: string; border: string } {
  if (score >= 85) return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
  if (score >= 70) return { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' };
  if (score >= 50) return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
  return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' };
}

function getGlowColor(score: number): string {
  if (score >= 85) return 'rgba(52,211,153,0.25)';
  if (score >= 70) return 'rgba(139,92,246,0.35)';
  if (score >= 50) return 'rgba(251,191,36,0.25)';
  return 'rgba(244,63,94,0.25)';
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function ScoreGauge({ score, label }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [dashOffset, setDashOffset] = useState(0);
  const hasAnimated = useRef(false);

  // SVG circle geometry
  const radius = 90;
  const strokeWidth = 12;
  const cx = 110;
  const cy = 110;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Kick off animation after mount
    const timer = setTimeout(() => {
      hasAnimated.current = true;
      const clampedScore = Math.min(100, Math.max(0, score));
      const offset = circumference - (clampedScore / 100) * circumference;
      setDashOffset(offset);
      setAnimatedScore(clampedScore);
    }, 150);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const badge = getBadgeStyle(animatedScore);
  const glowColor = getGlowColor(animatedScore);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Outer glow backdrop */}
      <div className="relative flex items-center justify-center">
        {/* Radial glow blur */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-70 pointer-events-none"
          style={{ background: glowColor, transform: 'scale(0.85)' }}
          aria-hidden="true"
        />

        {/* SVG Gauge */}
        <svg
          width={cx * 2}
          height={cy * 2}
          viewBox={`0 0 ${cx * 2} ${cy * 2}`}
          role="img"
          aria-label={`ATS Score: ${animatedScore} out of 100`}
          className="relative z-10"
        >
          <defs>
            {/* Track gradient */}
            <linearGradient id="scoreGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>

            {/* Glow filter for the arc */}
            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track ring */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Secondary decorative ring */}
          <circle
            cx={cx}
            cy={cy}
            r={radius - strokeWidth - 6}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={1}
          />

          {/* Score arc — animated via strokeDashoffset */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="url(#scoreGaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset === 0 ? circumference : dashOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            filter="url(#arcGlow)"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {/* Center: Score number */}
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-bold"
            style={{
              fontSize: '3rem',
              fontWeight: 800,
              fill: '#FFFFFF',
              letterSpacing: '-1px',
            }}
          >
            {Math.round(animatedScore)}
          </text>

          {/* Percent symbol in cyan */}
          <text
            x={cx + 34}
            y={cy - 22}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: '1.1rem', fontWeight: 700, fill: '#22D3EE' }}
          >
            %
          </text>

          {/* "ATS Score" label below the number */}
          <text
            x={cx}
            y={cy + 22}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: '0.72rem', fill: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            ATS Score
          </text>
        </svg>
      </div>

      {/* Score label badge */}
      {label && (
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm font-semibold tracking-wide animate-fade-in',
            badge.bg,
            badge.text,
            badge.border,
          )}
          aria-label={`Score label: ${label}`}
        >
          {/* Dot indicator */}
          <span
            className={cn('w-1.5 h-1.5 rounded-full', badge.text.replace('text-', 'bg-'))}
            aria-hidden="true"
          />
          {label}
        </div>
      )}
    </div>
  );
}

export { ScoreGauge };
