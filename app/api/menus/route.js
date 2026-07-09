import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';
import { withTimestamps } from '@/lib/sanityHelpers';
import { slugify } from '@/lib/slugify';

// GET /api/menus — list all menus (summary, no full item tree)
// ?position=header  → returns only the menu assigned to that position (single)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const positionFilter = searchParams.get('position');

    const filterStr = positionFilter
      ? '_type == "menu" && position == $position'
      : '_type == "menu"';

    const menus = await client.fetch(
      `*[${filterStr}] | order(_createdAt desc){
        name, handle, position, items,
        "createdAt": _createdAt,
        "updatedAt": _updatedAt
      }`,
      positionFilter ? { position: positionFilter } : {}
    );

    // Add item count without sending full tree
    const summary = menus.map((m) => ({
      ...m,
      itemCount: (m.items || []).length,
    }));

    // If filtering by position, return the single menu directly for convenience
    if (positionFilter) {
      const menu = summary[0] || null;
      return NextResponse.json({ success: true, menu, menus: summary }, { status: 200 });
    }

    return NextResponse.json({ success: true, menus: summary }, { status: 200 });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/menus — create new menu
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, position = 'none' } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Menu name is required' }, { status: 400 });
    }

    const handle = slugify(name.trim());

    // Ensure handle is unique
    const existing = await client.fetch(`*[_type == "menu" && handle == $handle][0]{_id}`, { handle });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `A menu with handle "${handle}" already exists` },
        { status: 409 }
      );
    }

    // If position is header/footer/sidebar, unset that position on other menus first
    if (position !== 'none') {
      const clashingIds = await client.fetch(`*[_type == "menu" && position == $position]._id`, { position });
      if (clashingIds.length) {
        const tx = client.transaction();
        clashingIds.forEach((id) => tx.patch(id, { set: { position: 'none' } }));
        await tx.commit();
      }
    }

    const menu = await client.create({ _type: 'menu', name: name.trim(), handle, position, items: [] });
    return NextResponse.json({ success: true, menu: withTimestamps(menu) }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
