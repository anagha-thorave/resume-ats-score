'use client';

import React from 'react';
import { Download, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { ScoreGauge } from './ScoreGauge';
import { KeywordCard } from './KeywordCard';
import { FormattingCard } from './FormattingCard';
import { SkillChipsCard } from './SkillChipsCard';
import { CategoryBreakdown } from './CategoryBreakdown';
import { RecommendationsDrawer } from './RecommendationsDrawer';
import type { AnalysisResponse, ResumeResponse } from '@/lib/types';

const confettiImport = () => import('canvas-confetti').then((m) => m.default);

interface ResumeAnalyzerViewProps {
  analysis: AnalysisResponse;
  resume: ResumeResponse;
  onOpenUpload: () => void;
  onExportPDF: () => Promise<void>;
  onOpenEditor: () => void;
  onOpenComparison: () => void;
  onAddSkill: (skill: string) => void;
  onApplyRecommendation: (recId: string, action: string, customText?: string) => Promise<void>;
}

export function ResumeAnalyzerView({
  analysis,
  resume,
  onOpenUpload,
  onExportPDF,
  onOpenEditor,
  onOpenComparison,
  onAddSkill,
  onApplyRecommendation,
}: ResumeAnalyzerViewProps) {
  const reqKeywordsTotal = (analysis.matched_keywords?.length || 0) + (analysis.missing_keywords?.length || 0);
  const matchPct = reqKeywordsTotal > 0
    ? Math.round(((analysis.matched_keywords?.length || 0) / reqKeywordsTotal) * 100)
    : 70;

  const handleDownload = async () => {
    await onExportPDF();
    const confetti = await confettiImport();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Grid Section Matching Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Mockup ATS Score & Resume Card) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: ATS Analysis Score */}
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-200 hover:border-brandViolet/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white tracking-wide">
                ATS Analysis Score
              </h3>
              <span className="text-[11px] font-semibold text-brandViolet bg-brandViolet/10 px-2.5 py-0.5 rounded-full border border-brandViolet/20">
                Job: {analysis.job_title}
              </span>
            </div>

            {/* Circular Gauge */}
            <ScoreGauge score={analysis.overall_score} label={analysis.score_label} />

            {/* Resume File info block */}
            <div className="mt-6 pt-5 border-t border-white/5 text-center">
              <h4 className="text-base font-extrabold text-white truncate max-w-xs mx-auto">
                New CV: {analysis.resume_filename}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Your resume has been analyzed
              </p>
            </div>

            {/* Two Action Buttons matching mockup */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-white border border-white/10 transition shadow-sm active:scale-95"
              >
                <Download className="w-4 h-4 text-brandCyan" />
                <span>Download Report</span>
              </button>

              <button
                type="button"
                onClick={onOpenUpload}
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-white border border-white/10 transition shadow-sm active:scale-95"
              >
                <RefreshCw className="w-4 h-4 text-brandViolet" />
                <span>Upload New Resume</span>
              </button>
            </div>

            {/* Secondary CTAs: Edit & Compare */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                type="button"
                onClick={onOpenEditor}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-brandViolet to-brandIndigo text-white hover:opacity-95 shadow-lg shadow-brandViolet/20 transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Edit & Optimize</span>
              </button>

              <button
                type="button"
                onClick={onOpenComparison}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-900 text-brandCyan border border-brandCyan/25 hover:bg-slate-800 transition active:scale-95"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Compare Versions</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Mockup Keywords, Formatting, Skills Chips) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Keyword Match Progress Card */}
          <KeywordCard
            matchPercentage={matchPct}
            totalRequired={reqKeywordsTotal}
            matchedCount={analysis.matched_keywords?.length || 0}
          />

          {/* Formatting Feedback Card */}
          <FormattingCard feedback={analysis.formatting_feedback || []} />

          {/* Extracted Skills & Missing High-Value Keywords */}
          <SkillChipsCard
            extractedSkills={resume.parsed_data.technical_skills || []}
            missingKeywords={analysis.missing_keywords || []}
            onAddSkill={onAddSkill}
          />
        </div>
      </div>

      {/* Category-Level Breakdown */}
      <CategoryBreakdown categories={analysis.category_scores || []} />

      {/* AI Improvement Recommendations */}
      <RecommendationsDrawer
        recommendations={analysis.recommendations || []}
        onApplyRecommendation={onApplyRecommendation}
      />
    </div>
  );
}
