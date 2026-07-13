import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/customerAuth';

export async function POST() {
  return new NextResponse(
    JSON.stringify({ success: true, message: 'Logged out successfully' }),
    {
      status: 200,
      headers: {
        'Set-Cookie': clearSessionCookie(),
        'Content-Type': 'application/json',
      },
    }
  );
}
