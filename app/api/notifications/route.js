import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';

const NOTIFICATION_PROJECTION = `{
  ...,
  "createdAt": _createdAt,
  "updatedAt": _updatedAt
}`;

// GET /api/notifications — paginated, searchable, filterable
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('q') || '';
    const isReadParam = searchParams.get('isRead'); // 'true' | 'false' | null = all
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const conditions = ['_type == "notification"'];
    const params = {};

    if (search) {
      conditions.push('(title match $search || message match $search)');
      params.search = `*${search}*`;
    }

    if (isReadParam === 'true') conditions.push('isRead == true');
    else if (isReadParam === 'false') conditions.push('isRead == false');

    if (type && type !== 'all') {
      conditions.push('type == $type');
      params.type = type;
    }

    const filterStr = conditions.join(' && ');
    const total = await client.fetch(`count(*[${filterStr}])`, params);
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    const notifications = await client.fetch(
      `*[${filterStr}] | order(_createdAt desc) [${start}...${end}]${NOTIFICATION_PROJECTION}`,
      params
    );

    return NextResponse.json(
      { success: true, notifications, total, totalPages, currentPage: page },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/notifications — mark isRead for given ids (or all if markAll=true)
export async function PATCH(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { ids, isRead = true, markAll = false } = body;

    if (markAll) {
      const allIds = await client.fetch(`*[_type == "notification"]._id`);
      const tx = client.transaction();
      allIds.forEach((id) => tx.patch(id, { set: { isRead } }));
      await tx.commit();
      return NextResponse.json({ success: true, message: `${allIds.length} notifications updated` }, { status: 200 });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'No notification IDs provided' }, { status: 400 });
    }

    const tx = client.transaction();
    ids.forEach((id) => tx.patch(id, { set: { isRead } }));
    await tx.commit();

    return NextResponse.json({ success: true, message: `${ids.length} notifications updated` }, { status: 200 });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/notifications — delete by ids
export async function DELETE(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'No notification IDs provided' }, { status: 400 });
    }

    const tx = client.transaction();
    ids.forEach((id) => tx.delete(id));
    await tx.commit();

    return NextResponse.json({ success: true, message: `${ids.length} notifications deleted` }, { status: 200 });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
