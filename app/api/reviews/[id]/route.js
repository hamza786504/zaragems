import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';

const REVIEW_PROJECTION = `{
  ...,
  "createdAt": _createdAt,
  "updatedAt": _updatedAt,
  "productId": *[_type == "product" && _id == ^.productId][0]{ _id, title, images }
}`;

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const review = await client.fetch(`*[_type == "review" && _id == $id][0]${REVIEW_PROJECTION}`, { id });

    if (!review) {
      return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, review }, { status: 200 });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await client.fetch(`*[_type == "review" && _id == $id][0]{_id}`, { id });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 });
    }

    await client.patch(id).set(body).commit();
    const review = await client.fetch(`*[_type == "review" && _id == $id][0]${REVIEW_PROJECTION}`, { id });

    return NextResponse.json({ success: true, review }, { status: 200 });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const existing = await client.fetch(`*[_type == "review" && _id == $id][0]{_id}`, { id });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 });
    }

    await client.delete(id);

    return NextResponse.json({ success: true, message: 'Review deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
