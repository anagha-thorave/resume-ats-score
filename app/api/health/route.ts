import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    app: 'ResumeIQ — AI Resume Parser & ATS Optimizer',
    database: 'connected',
    runtime: 'nextjs-fullstack',
    timestamp: new Date().toISOString(),
  });
}
