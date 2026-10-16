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
  let filename = `${resume.parsed_data.contact.full_name.replace(/\s+/g, '_')}_Resume.doc`;

  if (exportId) {
    const exportRec = db.getExport(exportId);
    if (exportRec) {
      htmlContent = exportRec.content;
      filename = exportRec.filename.replace(/\.docx$/, '.doc');
    }
  }

  if (!htmlContent) {
    htmlContent = generateResumeHtml(resume.parsed_data, 'classic_professional');
  }

  // Word application can directly open HTML with Word MIME type as clean editable document
  return new Response(htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/msword; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
