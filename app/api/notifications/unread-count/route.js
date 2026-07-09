import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';

// GET /api/notifications/unread-count — lightweight count for header badge
export async function GET() {
  try {
    const count = await client.fetch(`count(*[_type == "notification" && isRead == false])`);
    return NextResponse.json({ success: true, count }, { status: 200 });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ success: false, count: 0, error: error.message }, { status: 500 });
  }
}
