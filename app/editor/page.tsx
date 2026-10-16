'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/common/AppShell';
import { ResumeEditor } from '@/components/editor/ResumeEditor';
import { useAppContext } from '@/lib/context';
import { api } from '@/lib/api';
import type { ParsedResumeData } from '@/lib/types';
import { FileText } from 'lucide-react';

export default function EditorPage() {
  const router = useRouter();
  const {
    activeResume,
    activeJob,
    setActiveResume,
    setActiveAnalysis,
    addToast,
  } = useAppContext();

  const handleUpdateResume = async (updatedData: ParsedResumeData) => {
    if (!activeResume) return;
    try {
      const updated = await api.updateResume(activeResume.id, updatedData);
      setActiveResume(updated);

      if (activeJob) {
        const analysis = await api.runAnalysis(updated, activeJob);
        setActiveAnalysis(analysis);
      }
      addToast('Resume updated and ATS score synchronized!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save error';
      addToast(`Error: ${msg}`, 'error');
    }
  };

  const handleExportPDF = async (templateName: string) => {
    if (!activeResume) return;
    try {
      addToast('Preparing ATS-optimized PDF document...', 'info');
      const res = await api.exportPDF(activeResume.id, templateName);
      const downloadUrl = api.getPDFDownloadUrl(activeResume.id, res.export_id);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.download = res.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('PDF downloaded successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      addToast(`Export error: ${msg}`, 'error');
    }
  };

  const handleSaveVersion = async (name: string, template: string) => {
    if (!activeResume) return;
    try {
      await api.saveVersion(activeResume.id, name, template, activeResume.parsed_data);
      addToast(`Saved version snapshot '${name}'`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save version failed';
      addToast(msg, 'error');
    }
  };

  return (
    <AppShell pageTitle="Resume Editor & Live A4 PDF Generator">
      {activeResume ? (
        <ResumeEditor
          resume={activeResume}
          onUpdateResume={handleUpdateResume}
          onExportPDF={handleExportPDF}
          onSaveVersion={handleSaveVersion}
        />
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto my-12 animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-brandViolet/20 flex items-center justify-center text-brandViolet mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Resume Loaded</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Please upload a resume or load the sample candidate to access the live structured editor and A4 PDF preview.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brandViolet text-white hover:bg-violet-600 transition shadow-lg shadow-brandViolet/20"
            >
              Go to Dashboard to Load Demo
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
