import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; versionId: string } },
) {
  const resume = db.getResume(params.id);
  if (!resume) {
    return NextResponse.json({ detail: 'Resume not found' }, { status: 404 });
  }

  const versions = db.getVersions(params.id);
  const targetVersion = versions.find((v) => v.id === params.versionId);
  if (!targetVersion) {
    return NextResponse.json({ detail: 'Version snapshot not found' }, { status: 404 });
  }

  resume.parsed_data = targetVersion.resume_content;
  resume.updated_at = new Date().toISOString();
  db.saveResume(resume);

  return NextResponse.json(resume);
}
