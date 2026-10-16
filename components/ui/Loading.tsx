'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full border-transparent border-t-purple-500 border-r-purple-400',
          'animate-spin',
          sizeClasses[size],
        )}
        style={{
          borderStyle: 'solid',
          borderTopColor: '#8B5CF6',
          borderRightColor: '#22D3EE',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
        }}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && (
        <p className="text-xs font-medium text-slate-400 animate-pulse">{label}</p>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Processing...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-midnight/80 backdrop-blur-sm flex items-center justify-center">
      <div className="glass-card rounded-3xl p-8 flex flex-col items-center gap-4 border border-purple-500/20 shadow-2xl">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-300">{message}</p>
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('shimmer-loading rounded-xl bg-slate-800/60', className)}
      aria-hidden="true"
    />
  );
}
