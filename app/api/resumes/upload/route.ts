import { NextRequest, NextResponse } from 'next/server';
import { createRequire } from 'node:module';
import { db } from '@/lib/db';
import { parseResumeText } from '@/lib/parser';
import type { ResumeResponse } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ detail: 'No file uploaded' }, { status: 400 });
    }

    const filename = file.name;
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf') {
      return NextResponse.json(
        { detail: `Unsupported file format '${ext}'. Please upload a PDF (.pdf) file.` },
        { status: 400 },
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ detail: 'File exceeds maximum size limit of 10MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      return NextResponse.json({ detail: 'The uploaded file is not a valid PDF.' }, { status: 400 });
    }

    const require = createRequire(import.meta.url);
    const { PDFParse } = require('pdf-parse') as typeof import('pdf-parse');
    const pdfParser = new PDFParse({ data: buffer });
    let extractedText: string;
    try {
      const result = await pdfParser.getText();
      extractedText = result.text.replace(/\0/g, ' ').trim();
    } finally {
      await pdfParser.destroy();
    }

    if (extractedText.replace(/\s/g, '').length < 40) {
      return NextResponse.json(
        { detail: 'No readable text was found. This may be a scanned PDF; upload a text-based PDF instead.' },
        { status: 422 },
      );
    }

    const parsedData = parseResumeText(extractedText, filename);
    const resumeId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const resume: ResumeResponse = {
      id: resumeId,
      original_filename: filename,
      file_type: file.type || 'application/pdf',
      file_size: file.size,
      extracted_text: extractedText,
      parsed_data: parsedData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.saveResume(resume);

    return NextResponse.json(resume);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ detail: msg }, { status: 500 });
  }
}
