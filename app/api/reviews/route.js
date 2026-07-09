import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';
import { withTimestamps } from '@/lib/sanityHelpers';

const REVIEW_PROJECTION = `{
  ...,
  "createdAt": _createdAt,
  "updatedAt": _updatedAt,
  "productId": *[_type == "product" && _id == ^.productId][0]{ _id, title, images }
}`;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');

    const conditions = ['_type == "review"'];
    const params = {};

    if (productId) {
      conditions.push('productId == $productId');
      params.productId = productId;
    }
    if (status && status !== 'All') {
      conditions.push('status == $status');
      params.status = status.toLowerCase();
    }

    const reviews = await client.fetch(
      `*[${conditions.join(' && ')}] | order(_createdAt desc)${REVIEW_PROJECTION}`,
      params
    );

    return NextResponse.json({ success: true, reviews }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Bulk operations
    if (body.action === 'bulk-approve' && body.ids) {
      const tx = client.transaction();
      body.ids.forEach((id) => tx.patch(id, { set: { status: 'approved' } }));
      await tx.commit();
      return NextResponse.json({ success: true, modifiedCount: body.ids.length }, { status: 200 });
    }

    if (body.action === 'bulk-delete' && body.ids) {
      const tx = client.transaction();
      body.ids.forEach((id) => tx.delete(id));
      await tx.commit();
      return NextResponse.json({ success: true, deletedCount: body.ids.length }, { status: 200 });
    }

    // Single review creation
    const review = await client.create({ _type: 'review', status: 'pending', ...body });
    return NextResponse.json({ success: true, review: withTimestamps(review) }, { status: 201 });
  } catch (error) {
    console.error('Error processing review request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
