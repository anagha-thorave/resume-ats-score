import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const user = db.getDefaultUser();
  return NextResponse.json({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
  });
}
