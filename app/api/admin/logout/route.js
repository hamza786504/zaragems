import { NextResponse } from 'next/server';
import { stringifySetCookie } from 'cookie';

export async function POST() {
  // Clear the admin_token cookie
  const cookie = stringifySetCookie({
    name: 'admin_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0), // Set expiry date in the past to delete the cookie
    path: '/',
  });

  return new NextResponse(
    JSON.stringify({
      success: true,
      message: 'Logged out successfully',
    }),
    {
      status: 200,
      headers: {
        'Set-Cookie': cookie,
        'Content-Type': 'application/json',
      },
    }
  );
}
