'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bell, Settings, Sun, Moon, Sparkles, UploadCloud,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  pageTitle: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  candidateName?: string;
  onUploadClick: () => void;
}

export function Navbar({
  pageTitle,
  theme,
  onToggleTheme,
  candidateName = 'Alex Chen',
  onUploadClick,
}: NavbarProps) {
  // Generate initials from name
  const initials = candidateName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AC';

  return (
    <header className="h-16 border-b border-white/5 bg-surface/60 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Page Title — push left of hamburger on mobile */}
      <div className="flex items-center space-x-3 ml-12 lg:ml-0">
        <h2 className="text-sm lg:text-base font-extrabold text-white tracking-tight truncate max-w-[160px] sm:max-w-none">
          {pageTitle}
        </h2>
        <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
          AI Powered
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Upload button */}
        <button
          type="button"
          onClick={onUploadClick}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition active:scale-[0.97]"
          aria-label="Upload resume"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Resume</span>
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Notification bell */}
        <button
          type="button"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </button>

        {/* Settings */}
        <Link
          href="/history"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* User avatar */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-purple-500/30 shrink-0">
            {initials}
          </div>
          <div className="hidden md:block text-left min-w-0">
            <p className="text-xs font-bold text-white leading-none truncate max-w-[100px]">
              {candidateName}
            </p>
            <p className="text-[10px] text-slate-400 leading-none mt-1">
              Full Stack Engineer
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
