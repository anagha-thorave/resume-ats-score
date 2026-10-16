import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateResumeHtml } from '@/lib/export';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const exportId = req.nextUrl.searchParams.get('export_id');
  const resume = db.getResume(params.id);

  if (!resume) {
    return NextResponse.json({ detail: 'Resume not found' }, { status: 404 });
  }

  let htmlContent = '';
  let filename = `${resume.parsed_data.contact.full_name.replace(/\s+/g, '_')}_Resume.html`;

  if (exportId) {
    const exportRec = db.getExport(exportId);
    if (exportRec) {
      htmlContent = exportRec.content;
      filename = exportRec.filename.replace(/\.pdf$/, '.html');
    }
  }

  if (!htmlContent) {
    htmlContent = generateResumeHtml(resume.parsed_data, 'classic_professional');
  }

  // Return HTML document that triggers browser print/save-as-PDF or direct view
  return new Response(htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  });
}
