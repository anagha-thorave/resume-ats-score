import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractJobRequirements } from '@/lib/parser';
import type { JobDescriptionResponse } from '@/lib/types';

function isSafePublicUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, job_title_fallback, company_fallback } = body;

    if (!url || !isSafePublicUrl(url)) {
      return NextResponse.json(
        { detail: 'Invalid URL or restricted private network address. SSRF protection enforced.' },
        { status: 400 },
      );
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
      redirect: 'follow',
    });

    if (!res.ok) {
      return NextResponse.json(
        { detail: `Failed to fetch page. HTTP Status: ${res.status}` },
        { status: 400 },
      );
    }

    const html = await res.text();
    // Strip scripts, styles, and tags
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanText.length < 100) {
      return NextResponse.json(
        { detail: 'Page content too short or inaccessible to extract job description.' },
        { status: 400 },
      );
    }

    const title = job_title_fallback || 'Imported Job Role';
    const requirements = extractJobRequirements(title, cleanText);
    const id = `job-${Date.now()}`;

    const job: JobDescriptionResponse = {
      id,
      title,
      company_name: company_fallback || '',
      description_text: cleanText.substring(0, 4000),
      extracted_requirements: requirements,
      created_at: new Date().toISOString(),
    };

    db.saveJobDescription(job);

    return NextResponse.json(job);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Import failed';
    return NextResponse.json({ detail: msg }, { status: 500 });
  }
}
