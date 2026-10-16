'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/common/AppShell';
import { HistoryView } from '@/components/history/HistoryView';
import { useAppContext } from '@/lib/context';
import { api } from '@/lib/api';

export default function HistoryPage() {
  const router = useRouter();
  const {
    activeResume,
    activeJob,
    setActiveResume,
    setActiveJob,
    setActiveAnalysis,
    setLoading,
    addToast,
  } = useAppContext();

  const handleSelectAnalysis = async (analysisId: string) => {
    try {
      setLoading(true);
      const analysis = await api.getAnalysis(analysisId);
      setActiveAnalysis(analysis);

      const resume = await api.getResume(analysis.resume_id);
      setActiveResume(resume);

      const jobs = await api.listJobDescriptions();
      const job = jobs.find((j) => j.id === analysis.job_description_id);
      if (job) setActiveJob(job);

      addToast(`Loaded historical analysis: ${analysis.job_title}`, 'success');
      router.push('/dashboard');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load analysis';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!activeResume) return;
    try {
      setLoading(true);
      const restored = await api.restoreVersion(activeResume.id, versionId);
      setActiveResume(restored);

      if (activeJob) {
        const analysis = await api.runAnalysis(restored.id, activeJob.id);
        setActiveAnalysis(analysis);
      }
      addToast('Resume restored to selected version snapshot!', 'success');
      router.push('/dashboard');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to restore';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell pageTitle="History & Saved Resume Versions">
      <HistoryView
        activeResumeId={activeResume?.id}
        onSelectAnalysis={handleSelectAnalysis}
        onRestoreVersion={handleRestoreVersion}
      />
    </AppShell>
  );
}
