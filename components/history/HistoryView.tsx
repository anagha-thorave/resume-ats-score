'use client';

import React, { useState, useEffect } from 'react';
import {
  History, RotateCcw, Trash2, ArrowUpRight, BarChart3,
  Layers, ShieldAlert, CheckCircle2, FileText,
} from 'lucide-react';
import type { DashboardSummary, ResumeVersionResponse } from '@/lib/types';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface HistoryViewProps {
  onSelectAnalysis: (analysisId: string) => void;
  onRestoreVersion: (versionId: string) => void;
  activeResumeId?: string;
}

export function HistoryView({
  onSelectAnalysis,
  onRestoreVersion,
  activeResumeId,
}: HistoryViewProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [versions, setVersions] = useState<ResumeVersionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const summ = await api.getDashboardSummary();
      setSummary(summ);

      if (activeResumeId) {
        const vers = await api.listVersions(activeResumeId);
        setVersions(vers);
      }
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeResumeId]);

  const handleDeleteAll = async () => {
    try {
      await api.deleteAllUserData();
      setDeleteStatus('All stored resumes, analyses, and generated files wiped permanently.');
      setDeleteConfirm(false);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed';
      setDeleteStatus('Error: ' + msg);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-brandViolet/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Resumes Processed</span>
            <FileText className="w-4 h-4 text-brandViolet" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {summary?.total_resumes || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Uploaded & Parsed documents</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-brandCyan/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Average ATS Score</span>
            <BarChart3 className="w-4 h-4 text-brandCyan" />
          </div>
          <div className="text-2xl font-extrabold text-brandCyan">
            {summary?.average_ats_score || 0}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all role evaluations</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Saved Resume Snapshots</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {summary?.saved_versions_count || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Job-specific resume versions</p>
        </div>
      </div>

      {deleteStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{deleteStatus}</span>
        </div>
      )}

      {/* Recent Analyses List */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-brandCyan" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Recent Job Fit Analyses
            </h3>
          </div>
          <span className="text-xs text-slate-400">Click to reopen and review</span>
        </div>

        {!summary?.recent_analyses || summary.recent_analyses.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic">
            No previous analyses recorded yet. Start by analyzing a resume!
          </p>
        ) : (
          <div className="space-y-2">
            {summary.recent_analyses.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectAnalysis(item.id)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 border border-white/5 hover:border-brandCyan/40 hover:bg-slate-900/80 cursor-pointer transition-all active:scale-[0.99]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectAnalysis(item.id);
                  }
                }}
              >
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                    <span>{item.job_title}</span>
                    {item.company_name && (
                      <span className="text-[11px] font-normal text-slate-400">
                        at {item.company_name}
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Resume: {item.resume_filename} • {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-extrabold',
                      item.overall_score >= 75
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.overall_score >= 60
                        ? 'bg-brandCyan/10 text-brandCyan border border-brandCyan/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                    )}
                  >
                    {Math.round(item.overall_score)}% ATS
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resume Versions */}
      {versions.length > 0 && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-brandViolet" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Saved Resume Versions
              </h3>
            </div>
            <span className="text-xs text-slate-400">{versions.length} versions</span>
          </div>

          <div className="space-y-2">
            {versions.map((ver) => (
              <div
                key={ver.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 border border-white/5"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{ver.version_name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Template: {ver.template_name} • Created: {new Date(ver.created_at).toLocaleString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onRestoreVersion(ver.id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brandViolet/20 text-brandViolet border border-brandViolet/30 hover:bg-brandViolet/30 transition active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy & GDPR Management */}
      <div className="glass-card rounded-2xl p-5 border border-rose-500/20 space-y-3">
        <div className="flex items-center space-x-2 text-rose-400">
          <ShieldAlert className="w-4 h-4" />
          <h3 className="text-sm font-bold tracking-wide">Privacy & Data Purge (GDPR)</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          In compliance with privacy standards, you can permanently wipe all uploaded documents, parsed content, saved resume versions, and analysis metrics from our database at any time.
        </p>

        {deleteConfirm ? (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between animate-fade-in">
            <span className="text-xs text-rose-300 font-semibold">
              Are you sure? This cannot be undone.
            </span>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition"
              >
                Yes, Purge Everything
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All Personal Data & Resumes</span>
          </button>
        )}
      </div>
    </div>
  );
}
