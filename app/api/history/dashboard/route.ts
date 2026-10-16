import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const summary = db.getDashboardSummary();
  return NextResponse.json(summary);
}
