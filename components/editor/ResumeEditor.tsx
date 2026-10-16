'use client';

import React, { useState } from 'react';
import {
  Save, Download, Plus, Trash2, FileText, CheckCircle2,
  Sparkles, Layers, Eye, X, ChevronDown,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import type { ParsedResumeData, ResumeResponse } from '@/lib/types';
import { api } from '@/lib/api';

// Canvas confetti loaded client-side only
const confettiImport = () => import('canvas-confetti').then((m) => m.default);

interface ResumeEditorProps {
  resume: ResumeResponse;
  onUpdateResume: (updated: ParsedResumeData) => Promise<void>;
  onExportPDF: (template: string) => Promise<void>;
  onSaveVersion: (name: string, template: string) => Promise<void>;
}

type EditorTab = 'experience' | 'skills' | 'summary' | 'education' | 'projects' | 'contact';

const TEMPLATES = [
  { id: 'classic_professional', label: 'Classic ATS' },
  { id: 'modern_minimal', label: 'Modern Minimal' },
  { id: 'technical_fresher', label: 'Technical' },
];

const EDITOR_TABS: { id: EditorTab; label: string }[] = [
  { id: 'experience', label: 'Work Experience' },
  { id: 'skills', label: 'Tech Skills' },
  { id: 'summary', label: 'Summary' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

const inputClass =
  'w-full bg-slate-950/70 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition placeholder-slate-500';

export function ResumeEditor({
  resume,
  onUpdateResume,
  onExportPDF,
  onSaveVersion,
}: ResumeEditorProps) {
  const [data, setData] = useState<ParsedResumeData>(resume.parsed_data);
  const [activeTab, setActiveTab] = useState<EditorTab>('experience');
  const [selectedTemplate, setSelectedTemplate] = useState('classic_professional');
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ text: string; ok: boolean } | null>(null);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [exportingDocx, setExportingDocx] = useState(false);

  // ── Contact ─────────────────────────────────────────────
  const handleContactChange = (field: string, val: string) =>
    setData((prev) => ({ ...prev, contact: { ...prev.contact, [field]: val } }));

  // ── Skills ──────────────────────────────────────────────
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed || data.technical_skills.includes(trimmed)) return;
    setData((prev) => ({
      ...prev,
      technical_skills: [...prev.technical_skills, trimmed],
    }));
    setNewSkill('');
  };
  const handleRemoveSkill = (skill: string) =>
    setData((prev) => ({
      ...prev,
      technical_skills: prev.technical_skills.filter((s) => s !== skill),
    }));

  // ── Experience ──────────────────────────────────────────
  const handleAddExperience = () =>
    setData((prev) => ({
      ...prev,
      experience: [
        {
          id: `exp-${Date.now()}`,
          title: 'Software Engineer',
          company: 'Company Name',
          location: 'City, Country',
          start_date: '2023 - Present',
          bullets: ['Engineered scalable web applications and APIs.'],
        },
        ...prev.experience,
      ],
    }));

  const handleUpdateExp = (idx: number, field: string, val: unknown) =>
    setData((prev) => {
      const copy = [...prev.experience];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, experience: copy };
    });

  const handleRemoveExp = (idx: number) =>
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx),
    }));

  const handleUpdateBullet = (expIdx: number, bulletIdx: number, val: string) =>
    setData((prev) => {
      const exp = [...prev.experience];
      const bullets = [...exp[expIdx].bullets];
      bullets[bulletIdx] = val;
      exp[expIdx] = { ...exp[expIdx], bullets };
      return { ...prev, experience: exp };
    });

  const handleAddBullet = (expIdx: number) =>
    setData((prev) => {
      const exp = [...prev.experience];
      exp[expIdx] = {
        ...exp[expIdx],
        bullets: [...exp[expIdx].bullets, 'Spearheaded initiative, improving performance by X%.'],
      };
      return { ...prev, experience: exp };
    });

  const handleRemoveBullet = (expIdx: number, bulletIdx: number) =>
    setData((prev) => {
      const exp = [...prev.experience];
      exp[expIdx] = {
        ...exp[expIdx],
        bullets: exp[expIdx].bullets.filter((_, i) => i !== bulletIdx),
      };
      return { ...prev, experience: exp };
    });

  // ── Save / Export ────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      await onUpdateResume(data);
      setSaveStatus({ text: 'Changes saved successfully!', ok: true });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      setSaveStatus({ text: `Error: ${msg}`, ok: false });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    await handleSave();
    await onExportPDF(selectedTemplate);
    const confetti = await confettiImport();
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  };

  const handleDownloadDOCX = async () => {
    if (exportingDocx) return;
    setExportingDocx(true);
    try {
      await handleSave();
      const res = await api.exportDOCX(resume.id, selectedTemplate);
      const url = api.getDOCXDownloadUrl(resume.id, res.export_id);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setExportingDocx(false);
    }
  };

  const handleConfirmSaveVersion = async () => {
    if (!versionName.trim()) return;
    await handleSave();
    await onSaveVersion(versionName.trim(), selectedTemplate);
    setVersionModalOpen(false);
    setVersionName('');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Toolbar ── */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Resume Editor & Customizer</h3>
            <p className="text-xs text-slate-400">Live structured editing with ATS-safe constraints</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Template selector */}
          <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-white/5 text-xs">
            <span className="text-slate-400 pl-2 pr-1 font-medium text-[11px]">Template:</span>
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-medium transition',
                  selectedTemplate === tmpl.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white',
                )}
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition border border-white/10 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={() => setVersionModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-cyan-400 hover:bg-slate-700 transition border border-cyan-400/20"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Save Version</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-purple-500/20 hover:opacity-95 transition active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDOCX}
            disabled={exportingDocx}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportingDocx ? 'Generating...' : 'Export DOCX'}</span>
          </button>
        </div>
      </div>

      {/* Status message */}
      {saveStatus && (
        <div
          className={cn(
            'flex items-center space-x-2 p-3 rounded-xl text-xs animate-fade-in border',
            saveStatus.ok
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          )}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveStatus.text}</span>
        </div>
      )}

      {/* ── Editor / Preview split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Form editor */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs */}
          <div className="flex overflow-x-auto p-1 bg-slate-900/60 rounded-xl border border-white/5 text-xs gap-1">
            {EDITOR_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-3 py-2 rounded-lg font-medium whitespace-nowrap transition',
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── Contact ─── */}
          {activeTab === 'contact' && (
            <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {[
                  ['full_name', 'Full Name', 'text'],
                  ['email', 'Email Address', 'email'],
                  ['phone', 'Phone Number', 'text'],
                  ['location', 'Location', 'text'],
                  ['linkedin_url', 'LinkedIn URL', 'text'],
                  ['github_url', 'GitHub URL', 'text'],
                ].map(([field, label, type]) => (
                  <div key={field as string}>
                    <label className="block text-slate-300 font-semibold mb-1">{label}</label>
                    <input
                      type={type as string}
                      value={(data.contact[field as keyof typeof data.contact] as string) || ''}
                      onChange={(e) => handleContactChange(field as string, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Summary ─── */}
          {activeTab === 'summary' && (
            <div className="glass-card rounded-2xl p-5 space-y-3 animate-fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Professional Summary
              </h4>
              <textarea
                value={data.summary}
                onChange={(e) => setData({ ...data, summary: e.target.value })}
                rows={6}
                className={cn(inputClass, 'leading-relaxed')}
                placeholder="Enter executive summary highlighting your domain focus, years of experience, and key achievements..."
              />
              <p className="text-[11px] text-slate-500">{data.summary.length} characters</p>
            </div>
          )}

          {/* ─── Skills ─── */}
          {activeTab === 'skills' && (
            <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Technical Skills & Frameworks
                </h4>
                <span className="text-xs text-slate-400 font-semibold">
                  {data.technical_skills.length} skills
                </span>
              </div>
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill (e.g., Docker, Kubernetes, GraphQL)..."
                  className={cn(inputClass, 'flex-1')}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
              <div className="flex flex-wrap gap-2 pt-1">
                {data.technical_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-purple-400/70 hover:text-rose-300 transition"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ─── Experience ─── */}
          {activeTab === 'experience' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Work Experience
                </h4>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              {data.experience.map((exp, expIdx) => (
                <div key={expIdx} className="glass-card rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Role #{expIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExp(expIdx)}
                      className="text-rose-400/60 hover:text-rose-300 transition p-1 rounded-lg hover:bg-rose-500/10"
                      aria-label={`Remove ${exp.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {(['title', 'company', 'start_date', 'location'] as const).map((field) => (
                      <div key={field}>
                        <label className="block text-slate-300 mb-1 font-semibold capitalize">
                          {field === 'start_date' ? 'Date Range' : field.replace('_', ' ')}
                        </label>
                        <input
                          type="text"
                          value={(exp[field] as string) || ''}
                          onChange={(e) => handleUpdateExp(expIdx, field, e.target.value)}
                          placeholder={field === 'start_date' ? 'e.g. 2021 - Present' : ''}
                          className={inputClass}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Bullets */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">
                        Achievement Bullets (Action Verb + Metric)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddBullet(expIdx)}
                        className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center space-x-1 transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bullet</span>
                      </button>
                    </div>
                    {exp.bullets.map((bullet, bulletIdx) => (
                      <div key={bulletIdx} className="flex items-start space-x-2">
                        <span className="text-slate-500 mt-2.5 shrink-0">•</span>
                        <textarea
                          value={bullet}
                          onChange={(e) => handleUpdateBullet(expIdx, bulletIdx, e.target.value)}
                          rows={2}
                          className={cn(inputClass, 'flex-1 leading-relaxed')}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(expIdx, bulletIdx)}
                          className="text-slate-500 hover:text-rose-400 mt-2 transition shrink-0"
                          aria-label="Remove bullet"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── Education ─── */}
          {activeTab === 'education' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Education
              </h4>
              {data.education.map((edu, eduIdx) => (
                <div key={eduIdx} className="glass-card rounded-2xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {[
                      { key: 'degree', label: 'Degree' },
                      { key: 'institution', label: 'Institution' },
                      { key: 'graduation_year', label: 'Graduation Year' },
                      { key: 'gpa', label: 'GPA / Grade' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-slate-300 mb-1 font-semibold">{label}</label>
                        <input
                          type="text"
                          value={(edu[key as keyof typeof edu] as string) || ''}
                          onChange={(e) => {
                            const copy = [...data.education];
                            copy[eduIdx] = { ...copy[eduIdx], [key]: e.target.value };
                            setData({ ...data, education: copy });
                          }}
                          className={inputClass}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── Projects ─── */}
          {activeTab === 'projects' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Technical Projects
              </h4>
              {data.projects.map((proj, projIdx) => (
                <div key={projIdx} className="glass-card rounded-2xl p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const copy = [...data.projects];
                          copy[projIdx] = { ...copy[projIdx], title: e.target.value };
                          setData({ ...data, projects: copy });
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">
                        Technologies (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={proj.technologies.join(', ')}
                        onChange={(e) => {
                          const copy = [...data.projects];
                          copy[projIdx] = {
                            ...copy[projIdx],
                            technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                          };
                          setData({ ...data, projects: copy });
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {proj.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-start space-x-2">
                        <span className="text-slate-500 mt-2.5">•</span>
                        <textarea
                          value={b}
                          onChange={(e) => {
                            const copy = [...data.projects];
                            const bullets = [...copy[projIdx].bullets];
                            bullets[bIdx] = e.target.value;
                            copy[projIdx] = { ...copy[projIdx], bullets };
                            setData({ ...data, projects: copy });
                          }}
                          rows={2}
                          className={cn(inputClass, 'flex-1 leading-relaxed')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live A4 preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center space-x-1.5 text-white">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Live A4 Document Layout</span>
              </span>
              <span className="text-[11px] text-cyan-400 font-semibold">
                Template: {selectedTemplate.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>

            {/* A4 Sheet */}
            <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-6 text-[11px] leading-relaxed max-h-[750px] overflow-y-auto border border-slate-200 font-sans">
              {/* Header */}
              <div className="border-b border-slate-200 pb-3 mb-3">
                <h1 className="text-lg font-bold text-slate-950 tracking-tight">
                  {data.contact.full_name || 'Candidate Name'}
                </h1>
                <div className="text-[10px] text-slate-600 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                  {data.contact.email && <span>{data.contact.email}</span>}
                  {data.contact.phone && <span>• {data.contact.phone}</span>}
                  {data.contact.location && <span>• {data.contact.location}</span>}
                  {data.contact.linkedin_url && (
                    <span>• {data.contact.linkedin_url.replace('https://', '')}</span>
                  )}
                  {data.contact.github_url && (
                    <span>• {data.contact.github_url.replace('https://', '')}</span>
                  )}
                </div>
              </div>

              {/* Summary */}
              {data.summary && (
                <div className="mb-3">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1">
                    Professional Summary
                  </h2>
                  <p className="text-slate-700 text-[10.5px] leading-normal">{data.summary}</p>
                </div>
              )}

              {/* Skills */}
              {data.technical_skills.length > 0 && (
                <div className="mb-3">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1">
                    Technical Skills
                  </h2>
                  <p className="text-slate-800 text-[10.5px]">
                    <span className="font-semibold">Core: </span>
                    {data.technical_skills.join(', ')}
                  </p>
                </div>
              )}

              {/* Experience */}
              {data.experience.length > 0 && (
                <div className="mb-3">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
                    Professional Experience
                  </h2>
                  <div className="space-y-2.5">
                    {data.experience.map((exp, i) => (
                      <div key={i}>
                        <div className="flex justify-between font-bold text-slate-900 text-[10.5px]">
                          <span>
                            {exp.title} —{' '}
                            <span className="font-semibold text-slate-700">{exp.company}</span>
                          </span>
                          <span className="text-[9.5px] text-slate-500 font-normal">
                            {exp.start_date}
                          </span>
                        </div>
                        <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-700 text-[10px]">
                          {exp.bullets.map((b, bi) => (
                            <li key={bi} className="leading-snug">{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {data.projects.length > 0 && (
                <div className="mb-3">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
                    Projects
                  </h2>
                  <div className="space-y-2">
                    {data.projects.map((p, i) => (
                      <div key={i}>
                        <p className="font-bold text-slate-900 text-[10.5px]">
                          {p.title}{' '}
                          {p.technologies.length > 0 && (
                            <span className="font-normal text-slate-500">
                              ({p.technologies.join(', ')})
                            </span>
                          )}
                        </p>
                        <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-700 text-[10px]">
                          {p.bullets.map((b, bi) => (
                            <li key={bi} className="leading-snug">{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {data.education.length > 0 && (
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1">
                    Education
                  </h2>
                  {data.education.map((edu, i) => (
                    <div key={i} className="flex justify-between text-[10.5px] text-slate-800">
                      <span>
                        <strong className="text-slate-900">{edu.degree}</strong>, {edu.institution}
                        {edu.gpa && ` | GPA: ${edu.gpa}`}
                      </span>
                      <span className="text-[9.5px] text-slate-500">{edu.graduation_year}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Save Version Modal ── */}
      {versionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md space-y-4 border border-cyan-400/30 animate-scale-in shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Save Resume Version</h3>
              <button
                onClick={() => setVersionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Save a distinct snapshot of your resume tailored for this job or iteration.
            </p>
            <input
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="e.g. Tailored for FinTech Senior Engineer"
              className={inputClass}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmSaveVersion();
              }}
              autoFocus
            />
            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setVersionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveVersion}
                disabled={!versionName.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition disabled:opacity-50"
              >
                Save Version Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
