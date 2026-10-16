import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  const user = db.getDefaultUser();
  const token = `resumeiq-demo-jwt-${Date.now()}`;

  return NextResponse.json({
    access_token: token,
    token_type: 'bearer',
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
    },
  });
}
