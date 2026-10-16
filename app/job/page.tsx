'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/common/AppShell';
import { JobMatcher } from '@/components/job/JobMatcher';
import { useAppContext } from '@/lib/context';
import { api } from '@/lib/api';

export default function JobPage() {
  const router = useRouter();
  const {
    activeResume,
    activeJob,
    loading,
    setActiveJob,
    setActiveAnalysis,
    setLoading,
    addToast,
  } = useAppContext();

  const handleAnalyzeJob = async (jobTitle: string, company: string, description: string) => {
    if (!activeResume) {
      addToast('Please upload or load a sample resume first!', 'warning');
      return;
    }

    setLoading(true);
    addToast('Extracting requirements and evaluating ATS match...', 'info');

    try {
      const job = await api.createJobDescription(jobTitle, company, description);
      setActiveJob(job);

      const analysis = await api.runAnalysis(activeResume, job);
      setActiveAnalysis(analysis);
      addToast('Job alignment analysis ready!', 'success');

      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis error';
      addToast(`Error: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setLoading(true);
    try {
      const sample = await api.loadSampleJobDescription();
      setActiveJob(sample);

      if (activeResume) {
        const analysis = await api.runAnalysis(activeResume, sample);
        setActiveAnalysis(analysis);
        addToast('Sample FinTech job loaded and analyzed!', 'success');
        router.push('/dashboard');
      } else {
        addToast('Sample job loaded! Next, upload or load a resume.', 'info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load sample job';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell pageTitle="Target Job Description Matcher">
      <JobMatcher
        onAnalyze={handleAnalyzeJob}
        onLoadSample={handleLoadSample}
        currentJob={activeJob}
        loading={loading}
      />
    </AppShell>
  );
}
