import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const analysis = db.getAnalysis(params.id);
  if (!analysis) {
    return NextResponse.json({ detail: 'Analysis not found' }, { status: 404 });
  }
  return NextResponse.json(analysis);
}
