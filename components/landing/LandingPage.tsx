'use client';

import React, { useState } from 'react';
import {
  Sparkles, FileText, Target, ShieldCheck, ArrowRight,
  CheckCircle, ChevronDown, ChevronUp, Download, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenAuth: () => void;
  onExploreFeatures: () => void;
}

export function LandingPage({
  onGetStarted,
  onOpenAuth,
  onExploreFeatures,
}: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'How does ResumeIQ calculate ATS compatibility scores?',
      a: 'ResumeIQ utilizes an explainable 6-category rubric: Required Keyword & Skill Coverage (30%), Relevant Experience Alignment (25%), Qualifications & Education (15%), Projects Relevance (15%), Structure & Readability (10%), and Contact Completeness (5%). It uses exact token matching, synonym canonicalization, and cosine similarity.',
    },
    {
      q: 'Does ResumeIQ invent or fabricate resume experience?',
      a: 'No. ResumeIQ operates with a strict Zero-Hallucination policy. It transforms passive phrasing into proactive action verbs and identifies skill gaps, but never fabricates false metrics, unverified employers, or credentials you do not possess.',
    },
    {
      q: 'What file formats are supported for upload and export?',
      a: 'You can upload both PDF (.pdf) and Microsoft Word (.docx) resumes. For export, you can download ATS-friendly PDF resumes with selectable text or formatted Word documents (.docx).',
    },
    {
      q: 'Is my personal resume data kept private?',
      a: 'Yes. Documents are parsed in isolated environments. We do not sell or train public models on your resume data. You can permanently wipe all your uploaded documents, saved versions, and analysis metrics at any time using our one-click GDPR data purge.',
    },
  ];

  return (
    <div className="min-h-screen bg-midnight text-slate-100 flex flex-col selection:bg-brandViolet/30">
      {/* Top Navigation */}
      <header className="border-b border-white/5 bg-surface/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brandViolet via-brandIndigo to-brandCyan flex items-center justify-center text-white shadow-lg shadow-brandViolet/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Resume<span className="text-brandCyan">IQ</span>
              </span>
              <span className="ml-2 text-[10px] font-semibold text-brandViolet bg-brandViolet/10 px-2 py-0.5 rounded-full border border-brandViolet/25">
                v1.0
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-brandCyan transition">Features</a>
            <a href="#how-it-works" className="hover:text-brandCyan transition">How It Works</a>
            <a href="#security" className="hover:text-brandCyan transition">Security & Privacy</a>
            <a href="#faq" className="hover:text-brandCyan transition">FAQ</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-brandViolet via-brandIndigo to-brandCyan text-white shadow-lg shadow-brandViolet/25 hover:opacity-95 transition active:scale-95"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brandViolet/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-brandCyan/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brandViolet/15 border border-brandViolet/30 text-xs font-semibold text-brandCyan animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-brandCyan" />
            <span>AI Resume Parsing & ATS Compatibility Scoring Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your Resume. <br />
            <span className="gradient-text">Optimized for Every Opportunity.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Extract candidate data from PDF & DOCX resumes, benchmark alignment against target job descriptions, discover keyword gaps, rewrite bullets with proven action verbs, and export clean, ATS-compliant resumes.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="flex items-center space-x-2 px-7 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-brandViolet via-brandIndigo to-brandCyan text-white shadow-xl shadow-brandViolet/30 hover:scale-[1.02] transition active:scale-95"
            >
              <span>Analyze My Resume</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreFeatures}
              className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-slate-900 border border-white/10 hover:border-brandCyan/40 text-slate-200 transition active:scale-95"
            >
              Explore Features
            </button>
          </div>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="max-w-4xl mx-auto mt-14 relative z-10 animate-scale-in">
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Score Gauge Preview */}
              <div className="md:col-span-5 text-center flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-white/10">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className="absolute inset-0 bg-brandViolet/20 rounded-full blur-xl" />
                  <div className="w-32 h-32 rounded-full border-8 border-brandViolet/20 border-t-brandCyan border-r-brandViolet flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-white">78%</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">ATS Score</span>
                  </div>
                </div>
                <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold bg-brandViolet/15 text-brandViolet border border-brandViolet/30">
                  Strong Match (Senior Full Stack)
                </div>
              </div>

              {/* Right Mini Insight List */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Target Role Alignment</span>
                  <span className="text-brandCyan font-extrabold">65% Keyword Match</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brandViolet to-brandCyan w-[65%]" />
                </div>

                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Clean single-column ATS parsable layout</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Verified Bachelor&apos;s Degree in Computer Science</span>
                  </div>
                  <div className="flex items-center space-x-2 text-amber-400">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>3 missing high-value keywords identified (+ Docker, + K8s, + CI/CD)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-20 px-6 bg-slate-950/40 border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Engineered for Real Recruiter & ATS Compatibility
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
              Every feature is built around verifiable resume parsing standards and hiring system mechanics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-2xl p-6 space-y-3 border border-white/5 hover:border-brandViolet/30 transition">
              <div className="w-10 h-10 rounded-xl bg-brandViolet/20 text-brandViolet flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Multi-Format Parsing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extracts contact info, summary, experience, education, and skills from PDF and DOCX documents with reading-order layout awareness.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-3 border border-white/5 hover:border-brandCyan/30 transition">
              <div className="w-10 h-10 rounded-xl bg-brandCyan/20 text-brandCyan flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Explainable 6-Pillar ATS Rubric</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transparent mathematical scoring combining keyword coverage, semantic experience overlap, credentials, and structural layout.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-3 border border-white/5 hover:border-emerald-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Truthful AI Suggestions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rewrites bullets with high-impact action verbs and quantified structure without inventing artificial qualifications.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-3 border border-white/5 hover:border-brandPink/30 transition">
              <div className="w-10 h-10 rounded-xl bg-brandPink/20 text-brandPink flex items-center justify-center font-bold">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">A4 PDF & DOCX Generation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates clean, selectable A4 PDFs and editable Word (.docx) files across 3 ATS-compliant templates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Step Workflow */}
      <section id="how-it-works" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Three-Step Optimization Workflow</h2>
            <p className="text-xs md:text-sm text-slate-400">From uploaded resume to optimized, ATS-ready PDF in seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="glass-card rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-brandViolet text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Upload Your Resume</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload your current PDF or DOCX file. Our engine extracts structured fields and validates completeness.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-brandIndigo text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Target Job Analysis</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste the job description or enter a posting URL. Get an explainable ATS score with missing keywords and action-verb improvements.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-brandCyan text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-md">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Edit & Export Clean PDF</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review improvements in the structured live editor, choose your preferred ATS template, and download formatted PDF or DOCX files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy and Security Section */}
      <section id="security" className="py-16 px-6 bg-slate-950/60 border-t border-white/5">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 border border-emerald-500/20 space-y-4">
          <div className="flex items-center space-x-3 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="text-lg font-bold">Privacy & Security First Architecture</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Your personal resume information is sanitized, contained, and never leaked into third-party public models. We enforce strict server-side request forgery (SSRF) protection on URL imports, validate MIME types and file sizes, and support a <strong>one-click GDPR data purge</strong> allowing you to permanently wipe all stored resumes, analyses, versions, and exports at any moment.
          </p>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400">Common questions about ATS scoring and resume optimization.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="glass-card rounded-2xl p-4 border border-white/5 transition">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-200 hover:text-white"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-brandCyan" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-surface/80 py-10 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white">ResumeIQ</span>
            <span>• AI Resume Parser & ATS Score Analyzer</span>
          </div>

          <div className="flex space-x-6 text-slate-400">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#security" className="hover:text-white">Privacy Policy</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
            <a href="mailto:support@resumeiq.ai" className="hover:text-white">Contact</a>
          </div>

          <div>
            © {new Date().getFullYear()} ResumeIQ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
