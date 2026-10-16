import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateAtsScore } from '@/lib/scoring';
import type { AnalysisResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resume_id, job_description_id } = body;

    const resume = db.getResume(resume_id);
    if (!resume) {
      return NextResponse.json({ detail: 'Resume not found' }, { status: 404 });
    }

    const job = db.getJobDescription(job_description_id);
    if (!job) {
      return NextResponse.json({ detail: 'Job description not found' }, { status: 404 });
    }

    const scoring = calculateAtsScore(
      resume.parsed_data,
      job.extracted_requirements,
      resume.extracted_text || '',
    );

    const id = `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const analysis: AnalysisResponse = {
      id,
      resume_id: resume.id,
      job_description_id: job.id,
      job_title: job.title,
      company_name: job.company_name,
      resume_filename: resume.original_filename,
      overall_score: scoring.overall_score,
      score_label: scoring.score_label,
      category_scores: scoring.category_scores,
      matched_keywords: scoring.matched_keywords,
      missing_keywords: scoring.missing_keywords,
      formatting_feedback: scoring.formatting_feedback,
      recommendations: scoring.recommendations,
      created_at: new Date().toISOString(),
    };

    db.saveAnalysis(analysis);

    return NextResponse.json(analysis);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ detail: msg }, { status: 500 });
  }
}

export async function GET() {
  const list = db.listAnalyses();
  return NextResponse.json(list);
}
