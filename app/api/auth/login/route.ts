import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ detail: 'Email and password are required' }, { status: 400 });
    }

    let user = db.getUserByEmail(email);
    if (!user) {
      // Auto-provision user account for streamlined developer onboarding
      user = {
        id: `usr-${Date.now()}`,
        email: email.toLowerCase(),
        password_hash: 'hashed',
        full_name: email.split('@')[0].replace(/[._]/g, ' '),
        created_at: new Date().toISOString(),
      };
      db.saveUser(user);
    }

    const token = `resumeiq-jwt-${user.id}-${Date.now()}`;

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ detail: msg }, { status: 500 });
  }
}
