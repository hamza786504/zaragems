import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';

const MENU_PROJECTION = `{
  ...,
  "createdAt": _createdAt,
  "updatedAt": _updatedAt
}`;

// GET /api/menus/[handle] — full menu with items
export async function GET(request, { params }) {
  try {
    const { handle } = await params;
    const menu = await client.fetch(`*[_type == "menu" && handle == $handle][0]${MENU_PROJECTION}`, { handle });

    if (!menu) {
      return NextResponse.json({ success: false, message: 'Menu not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, menu }, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/menus/[handle] — update menu (name, position, items)
export async function PUT(request, { params }) {
  try {
    const { handle } = await params;
    const body = await request.json();
    const { name, position, items } = body;

    const menu = await client.fetch(`*[_type == "menu" && handle == $handle][0]{_id, position}`, { handle });
    if (!menu) {
      return NextResponse.json({ success: false, message: 'Menu not found' }, { status: 404 });
    }

    // If changing position to a named slot, clear it from other menus
    if (position && position !== 'none' && position !== menu.position) {
      const clashingIds = await client.fetch(
        `*[_type == "menu" && _id != $id && position == $position]._id`,
        { id: menu._id, position }
      );
      if (clashingIds.length) {
        const tx = client.transaction();
        clashingIds.forEach((id) => tx.patch(id, { set: { position: 'none' } }));
        await tx.commit();
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (position !== undefined) updateData.position = position;
    if (items !== undefined) updateData.items = items;

    await client.patch(menu._id).set(updateData).commit();
    const updated = await client.fetch(`*[_type == "menu" && _id == $id][0]${MENU_PROJECTION}`, { id: menu._id });

    return NextResponse.json({ success: true, menu: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/menus/[handle]
export async function DELETE(request, { params }) {
  try {
    const { handle } = await params;
    const menu = await client.fetch(`*[_type == "menu" && handle == $handle][0]{_id}`, { handle });

    if (!menu) {
      return NextResponse.json({ success: false, message: 'Menu not found' }, { status: 404 });
    }

    await client.delete(menu._id);

    return NextResponse.json({ success: true, message: 'Menu deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting menu:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
