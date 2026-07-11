import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import client from '@/lib/sanityClient';
import { slugify } from '@/lib/slugify';
import { PRODUCT_PROJECTION } from '@/lib/sanityQueries';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await client.fetch(`*[_type == "product" && _id == $id][0]${PRODUCT_PROJECTION}`, { id });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await client.fetch(`*[_type == "product" && _id == $id][0]{_id}`, { id });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    if (body.collectionId === '') {
      body.collectionId = null;
    }

    if (!body.slug && body.title) {
      body.slug = slugify(body.title);
    }

    if (body.slug) {
      const slugClash = await client.fetch(
        `*[_type == "product" && slug == $slug && _id != $id][0]{_id}`,
        { slug: body.slug, id }
      );
      if (slugClash) {
        return NextResponse.json(
          { success: false, error: `A product with slug "${body.slug}" already exists` },
          { status: 400 }
        );
      }
    }

    await client.patch(id).set(body).commit();
    // Purge ISR cache so edits appear immediately on the storefront.
    revalidateTag('products');
    const product = await client.fetch(`*[_type == "product" && _id == $id][0]${PRODUCT_PROJECTION}`, { id });

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const existing = await client.fetch(`*[_type == "product" && _id == $id][0]{_id}`, { id });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    await client.delete(id);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
