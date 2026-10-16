import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { ParsedResumeData } from '@/lib/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const resume = db.getResume(params.id);
  if (!resume) {
    return NextResponse.json({ detail: 'Resume not found' }, { status: 404 });
  }
  return NextResponse.json(resume);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const resume = db.getResume(params.id);
  if (!resume) {
    return NextResponse.json({ detail: 'Resume not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const updatedData = body.parsed_data as ParsedResumeData;
    if (!updatedData) {
      return NextResponse.json({ detail: 'Missing parsed_data' }, { status: 400 });
    }

    resume.parsed_data = updatedData;
    resume.updated_at = new Date().toISOString();
    db.saveResume(resume);

    return NextResponse.json(resume);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ detail: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const deleted = db.deleteResume(params.id);
  if (!deleted) {
    return NextResponse.json({ detail: 'Resume not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Resume deleted successfully' });
}
