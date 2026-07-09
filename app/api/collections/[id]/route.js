import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const collection = await client.fetch(
      `*[_type == "collection" && _id == $id][0]{
        ...,
        "createdAt": _createdAt,
        "updatedAt": _updatedAt
      }`,
      { id }
    );

    if (!collection) {
      return NextResponse.json({ success: false, message: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, collection }, { status: 200 });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await client.fetch(`*[_type == "collection" && _id == $id][0]{_id}`, { id });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Collection not found' }, { status: 404 });
    }

    if (body.name || body.slug) {
      const clash = await client.fetch(
        `*[_type == "collection" && _id != $id && (name == $name || slug == $slug)][0]{_id}`,
        { id, name: body.name || null, slug: body.slug || null }
      );
      if (clash) {
        return NextResponse.json(
          { success: false, error: 'A collection with this name or slug already exists' },
          { status: 400 }
        );
      }
    }

    await client.patch(id).set(body).commit();
    const collection = await client.fetch(
      `*[_type == "collection" && _id == $id][0]{
        ...,
        "createdAt": _createdAt,
        "updatedAt": _updatedAt
      }`,
      { id }
    );

    return NextResponse.json({ success: true, collection }, { status: 200 });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const existing = await client.fetch(`*[_type == "collection" && _id == $id][0]{_id}`, { id });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Collection not found' }, { status: 404 });
    }

    await client.delete(id);

    // Dissociate products from this collection
    const productIds = await client.fetch(`*[_type == "product" && collectionId == $id]._id`, { id });
    if (productIds.length) {
      const tx = client.transaction();
      productIds.forEach((pid) => tx.patch(pid, { set: { collectionId: null } }));
      await tx.commit();
    }

    return NextResponse.json({ success: true, message: 'Collection deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
