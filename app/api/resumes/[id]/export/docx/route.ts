import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateResumeHtml } from '@/lib/export';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const resume = db.getResume(params.id);
  if (!resume) {
    return NextResponse.json({ detail: 'Resume not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const templateName = body.template_name || 'classic_professional';
  const exportId = `exp-docx-${Date.now()}`;
  const filename = `${resume.parsed_data.contact.full_name.replace(/\s+/g, '_')}_Resume.docx`;

  const htmlContent = generateResumeHtml(resume.parsed_data, templateName);

  db.saveExport({
    id: exportId,
    user_id: 'usr-demo-001',
    resume_id: resume.id,
    version_id: body.version_id,
    filename,
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    content: htmlContent,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({
    export_id: exportId,
    filename,
    download_url: `/api/resumes/${resume.id}/download/docx?export_id=${exportId}`,
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    created_at: new Date().toISOString(),
  });
}
