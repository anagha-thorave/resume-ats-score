'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/common/AppShell';
import { ResumeAnalyzerView } from '@/components/analyzer/ResumeAnalyzerView';
import { ComparisonModal } from '@/components/analyzer/ComparisonModal';
import { useAppContext } from '@/lib/context';
import { api } from '@/lib/api';
import { FileText, Sparkles } from 'lucide-react';
import type { ParsedResumeData } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const {
    activeResume,
    activeJob,
    activeAnalysis,
    comparisonData,
    loading,
    setUploadOpen,
    setActiveResume,
    setActiveAnalysis,
    setComparisonData,
    setLoading,
    addToast,
  } = useAppContext();

  const [comparisonOpen, setComparisonOpen] = useState(false);

  const handleExportPDF = async () => {
    if (!activeResume) return;
    try {
      addToast('Generating ATS-compliant printable PDF...', 'info');
      const res = await api.exportPDF(activeResume.id, 'classic_professional');
      const downloadUrl = api.getPDFDownloadUrl(activeResume.id, res.export_id);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.download = res.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Resume report generated successfully!', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Export failed';
      addToast(`Export error: ${msg}`, 'error');
    }
  };

  const handleOpenComparison = async () => {
    if (!activeAnalysis) return;
    try {
      const comp = await api.getAnalysisComparison(activeAnalysis.id);
      setComparisonData(comp);
      setComparisonOpen(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to compute comparison';
      addToast(msg, 'error');
    }
  };

  const handleAddSkill = async (skill: string) => {
    if (!activeResume) return;
    if (activeResume.parsed_data.technical_skills.includes(skill)) {
      addToast(`'${skill}' is already in your skills`, 'info');
      return;
    }

    const updatedData: ParsedResumeData = {
      ...activeResume.parsed_data,
      technical_skills: [...activeResume.parsed_data.technical_skills, skill],
    };

    try {
      const updated = await api.updateResume(activeResume.id, updatedData);
      setActiveResume(updated);

      if (activeJob) {
        const analysis = await api.runAnalysis(updated.id, activeJob.id);
        setActiveAnalysis(analysis);
      }
      addToast(`Added '${skill}' to technical skills and updated ATS score!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      addToast(msg, 'error');
    }
  };

  const handleApplyRecommendation = async (recId: string, action: string, customText?: string) => {
    if (!activeAnalysis || !activeResume) return;
    try {
      await api.applyRecommendation(activeAnalysis.id, recId, action, customText);

      // Reload updated resume and analysis
      const updatedResume = await api.getResume(activeResume.id);
      setActiveResume(updatedResume);

      const updatedAnalysis = await api.getAnalysis(activeAnalysis.id);
      setActiveAnalysis(updatedAnalysis);

      addToast(action === 'rejected' ? 'Recommendation dismissed' : 'Applied recommendation to resume!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      addToast(msg, 'error');
    }
  };

  return (
    <AppShell pageTitle="ATS Resume Analyzer">
      {activeAnalysis && activeResume ? (
        <ResumeAnalyzerView
          analysis={activeAnalysis}
          resume={activeResume}
          onOpenUpload={() => setUploadOpen(true)}
          onExportPDF={handleExportPDF}
          onOpenEditor={() => router.push('/editor')}
          onOpenComparison={handleOpenComparison}
          onAddSkill={handleAddSkill}
          onApplyRecommendation={handleApplyRecommendation}
        />
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto my-12 animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-brandViolet/20 flex items-center justify-center text-brandViolet mx-auto">
            <FileText className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white">No Resume Active</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Upload your resume or load the pre-configured demo candidate to generate an instant ATS compatibility score and gap analysis.
          </p>
          <div className="flex justify-center space-x-3 pt-3">
            <button
              onClick={() => setUploadOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brandViolet text-white hover:bg-violet-600 transition shadow-lg shadow-brandViolet/20 active:scale-95"
            >
              Upload Resume
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await api.loadSampleResume();
                  setActiveResume(res);
                  const job = await api.loadSampleJobDescription();
                  const an = await api.runAnalysis(res.id, job.id);
                  setActiveAnalysis(an);
                  addToast('Loaded demo candidate!', 'success');
                } finally {
                  setLoading(false);
                }
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-brandCyan hover:bg-slate-700 transition active:scale-95"
            >
              Load Demo Data
            </button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      <ComparisonModal
        comparison={comparisonData}
        onClose={() => setComparisonOpen(false)}
      />
    </AppShell>
  );
}
