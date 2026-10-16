'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { Navbar } from '@/components/common/Navbar';
import { UploadModal, type ResumeIntakeAnswers } from '@/components/common/UploadModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { ComparisonModal } from '@/components/analyzer/ComparisonModal';
import { useAppContext } from '@/lib/context';
import { api } from '@/lib/api';

interface AppShellProps {
  pageTitle: string;
  children: React.ReactNode;
}

export function AppShell({ pageTitle, children }: AppShellProps) {
  const {
    activeResume,
    comparisonData,
    loading,
    uploadOpen,
    setActiveResume,
    setActiveJob,
    setActiveAnalysis,
    setComparisonData,
    setLoading,
    setUploadOpen,
    addToast,
  } = useAppContext();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [authOpen, setAuthOpen] = useState(false);

  const handleLoadDemo = async () => {
    try {
      setLoading(true);
      const resume = await api.loadSampleResume();
      setActiveResume(resume);
      const job = await api.loadSampleJobDescription();
      setActiveJob(job);
      const analysis = await api.runAnalysis(resume.id, job.id);
      setActiveAnalysis(analysis);
      addToast('Loaded synthetic candidate demo (Alex Chen)', 'success');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Could not load demo data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (file: File, answers: ResumeIntakeAnswers) => {
    setLoading(true);
    setActiveAnalysis(null);
    addToast('Extracting text from your PDF...', 'info');
    try {
      const resume = await api.uploadResume(file);
      setActiveResume(resume);

      const requiredSkills = answers.keySkills.split(/[,;\n]+/).map((skill) => skill.trim()).filter(Boolean);
      const description = answers.jobDescription || `Target role: ${answers.jobTitle}\nRequired skills: ${requiredSkills.join(', ')}`;
      const job = await api.createJobDescription(answers.jobTitle, '', description, {
        required_skills: requiredSkills,
        candidate_years_experience: answers.yearsExperience,
      });
      setActiveJob(job);

      const analysis = await api.runAnalysis(resume.id, job.id);
      setActiveAnalysis(analysis);
      addToast('ATS analysis complete!', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      addToast(`Resume analysis error: ${message}`, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const candidateName = activeResume?.parsed_data?.contact?.full_name || 'Candidate';

  return (
    <div className="min-h-screen bg-midnight text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-brandViolet/30">
      <Sidebar onLoadSample={handleLoadDemo} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        <Navbar
          pageTitle={pageTitle}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          candidateName={candidateName}
          onUploadClick={() => setUploadOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full space-y-6">{children}</main>
      </div>

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadFile={handleUploadFile}
        onLoadSample={handleLoadDemo}
        loading={loading}
      />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onLoginSuccess={() => addToast('Signed in successfully!', 'success')} />
      <ComparisonModal comparison={comparisonData} onClose={() => setComparisonData(null)} />
    </div>
  );
}
