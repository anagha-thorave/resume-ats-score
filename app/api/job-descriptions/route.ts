import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractJobRequirements } from '@/lib/parser';
import type { JobDescriptionResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, company_name, description_text } = body;

    if (!title || !description_text) {
      return NextResponse.json({ detail: 'Job title and description are required' }, { status: 400 });
    }

    const requiredSkills = Array.isArray(body.required_skills)
      ? body.required_skills.filter((skill: unknown): skill is string => typeof skill === 'string').map((skill: string) => skill.trim()).filter(Boolean)
      : [];
    const candidateYears = Number.isFinite(body.candidate_years_experience)
      ? Math.max(0, Math.min(60, Number(body.candidate_years_experience)))
      : undefined;
    const requirements = extractJobRequirements(title, description_text, requiredSkills, candidateYears);
    const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const job: JobDescriptionResponse = {
      id,
      title,
      company_name: company_name || '',
      description_text,
      extracted_requirements: requirements,
      created_at: new Date().toISOString(),
    };

    db.saveJobDescription(job);

    return NextResponse.json(job);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create job description';
    return NextResponse.json({ detail: msg }, { status: 500 });
  }
}

export async function GET() {
  const jobs = db.listJobDescriptions();
  return NextResponse.json(jobs);
}
