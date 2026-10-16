'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText, Briefcase, Edit3, History,
  Sparkles, LayoutDashboard, Menu, X, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    description: 'ATS Overview',
  },
  {
    id: 'analyzer',
    label: 'Resume Analyzer',
    icon: FileText,
    href: '/dashboard',
    badge: 'AI',
    description: 'Score & Analysis',
  },
  {
    id: 'job',
    label: 'Job Matcher',
    icon: Briefcase,
    href: '/job',
    description: 'Target Role',
  },
  {
    id: 'editor',
    label: 'Resume Editor',
    icon: Edit3,
    href: '/editor',
    description: 'Edit & Export PDF',
  },
  {
    id: 'history',
    label: 'History & Versions',
    icon: History,
    href: '/history',
    description: 'Saved snapshots',
  },
];

interface SidebarContentProps {
  pathname: string;
  onLoadSample: () => void;
  onClose?: () => void;
}

function SidebarContent({ pathname, onLoadSample, onClose }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3 py-4 mb-2">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center">
              Resume<span className="text-cyan-400">IQ</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
              AI ATS Optimizer
            </p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
                isActive
                  ? 'sidebar-item-active'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300',
                  )}
                />
                <div>
                  <span className="block leading-none">{item.label}</span>
                  <span
                    className={cn(
                      'text-[10px] font-normal leading-none mt-0.5',
                      isActive ? 'text-purple-300/70' : 'text-slate-500',
                    )}
                  >
                    {item.description}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={cn(
                    'w-3.5 h-3.5 transition-all',
                    isActive
                      ? 'text-purple-400 opacity-100'
                      : 'text-slate-600 opacity-0 group-hover:opacity-100',
                  )}
                />
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pt-4 px-2 pb-4 space-y-3 border-t border-white/5">
        {/* Pro Card */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white shadow-xl">
          {/* Decorative circles */}
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
          <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-cyan-400/20 rounded-full" />

          <div className="relative">
            <div className="flex items-center space-x-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span className="text-xs font-extrabold tracking-wide uppercase">
                ResumeIQ Pro
              </span>
            </div>
            <p className="text-[11px] text-purple-100 font-medium">
              Full-Stack ATS & AI Matching
            </p>
            <p className="text-[10px] text-purple-200/80 mt-1">
              289,727 / 600,000 Monthly Quota
            </p>

            <button
              type="button"
              onClick={onLoadSample}
              className="w-full mt-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition shadow-md active:scale-[0.98]"
            >
              Load Synthetic Demo
            </button>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex justify-between px-1 text-[10px] text-slate-500 font-medium">
          <Link href="/history" className="hover:text-slate-300 transition">
            Privacy & Data
          </Link>
          <span>•</span>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-300 transition"
          >
            API Docs
          </a>
          <span>•</span>
          <span className="text-slate-600">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  onLoadSample: () => void;
}

export function Sidebar({ onLoadSample }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-surface/90 border border-white/10 text-slate-300 hover:text-white shadow-lg backdrop-blur-sm transition"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-surface border-r border-white/5',
          'transition-transform duration-300 ease-in-out shadow-2xl',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Navigation sidebar"
      >
        <SidebarContent
          pathname={pathname || ''}
          onLoadSample={() => {
            onLoadSample();
            setMobileOpen(false);
          }}
          onClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-64 shrink-0 bg-surface/90 border-r border-white/5 flex-col min-h-screen sticky top-0"
        aria-label="Navigation sidebar"
      >
        <SidebarContent
          pathname={pathname || ''}
          onLoadSample={onLoadSample}
        />
      </aside>
    </>
  );
}
