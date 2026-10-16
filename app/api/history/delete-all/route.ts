import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  db.deleteAllUserData();
  return NextResponse.json({
    message: 'All stored documents, analyses, versions, and exports have been purged permanently (GDPR Compliant).',
  });
}
