import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { ResumeVersionResponse, ParsedResumeData } from '@/lib/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const resume = db.getResume(params.id);
  if (!resume) {
    return NextResponse.json({ detail: 'Resume not found' }, { status: 404 });
  }

  const body = await req.json();
  const existing = db.getVersions(params.id);
  const versionNum = existing.length + 1;

  const version: ResumeVersionResponse = {
    id: `ver-${Date.now()}-${versionNum}`,
    resume_id: resume.id,
    version_number: versionNum,
    version_name: body.version_name || `Version ${versionNum}`,
    template_name: body.template_name || 'classic_professional',
    resume_content: body.resume_content || resume.parsed_data,
    created_at: new Date().toISOString(),
  };

  db.saveVersion(resume.id, version);

  return NextResponse.json(version);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const versions = db.getVersions(params.id);
  return NextResponse.json(versions);
}
