'use client';

import React from 'react';
import { Plus, Sparkles, Check } from 'lucide-react';
import type { KeywordItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SkillChipsCardProps {
  extractedSkills: string[];
  missingKeywords: KeywordItem[];
  onAddSkill: (skill: string) => void;
}

export function SkillChipsCard({
  extractedSkills,
  missingKeywords,
  onAddSkill,
}: SkillChipsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Extracted Skills */}
      <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:border-purple-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <h4 className="text-sm font-bold text-white tracking-wide">Extracted Skills</h4>
          </div>
          <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
            {extractedSkills.length} Found
          </span>
        </div>

        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
          {extractedSkills.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No skills extracted yet.</p>
          ) : (
            extractedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
              >
                {skill}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Missing High-Value Keywords */}
      <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:border-amber-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white tracking-wide">Missing High-Value Keywords</h4>
          </div>
          <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            {missingKeywords.length} Gaps
          </span>
        </div>

        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
          {missingKeywords.length === 0 ? (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium py-2">
              <Check className="w-4 h-4" />
              <span>All key job requirements matched!</span>
            </div>
          ) : (
            missingKeywords.map((kw, idx) => (
              <button
                key={idx}
                onClick={() => onAddSkill(kw.keyword)}
                title={`Click to add '${kw.keyword}' to your resume (if experienced)`}
                className="group inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500 hover:text-slate-950 transition-all duration-150 cursor-pointer shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                <span>{kw.keyword}</span>
              </button>
            ))
          )}
        </div>
        <p className="text-[10px] text-slate-400 mt-3 italic">
          Click any missing skill above to incorporate it into your resume after personal confirmation.
        </p>
      </div>
    </div>
  );
}
