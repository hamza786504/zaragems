import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import client from '@/lib/sanityClient';
import { withTimestamps } from '@/lib/sanityHelpers';
import { slugify } from '@/lib/slugify';
import { PRODUCT_PROJECTION } from '@/lib/sanityQueries';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';
    const collectionId = searchParams.get('collectionId') || '';
    const productType = searchParams.get('type') || '';
    const vendor = searchParams.get('vendor') || '';
    const slug = searchParams.get('slug') || '';
    // Pagination — default limit=1000 keeps existing callers working
    const limit  = Math.min(parseInt(searchParams.get('limit')  || '1000', 10), 200);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0',    10), 0);

    // If slug is provided, return single product by slug
    if (slug) {
      const product = await client.fetch(
        `*[_type == "product" && slug == $slug][0]${PRODUCT_PROJECTION}`,
        { slug }
      );
      if (!product) {
        return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, product }, { status: 200 });
    }

    const conditions = ['_type == "product"'];
    const params = {};

    if (search) {
      conditions.push('(title match $search || description match $search || SKU match $search)');
      params.search = `*${search}*`;
    }

    if (status && status !== 'All Statuses') {
      conditions.push('status == $status');
      params.status = status.toLowerCase();
    }

    if (collectionId) {
      conditions.push('collectionId == $collectionId');
      params.collectionId = collectionId;
    }

    if (productType && productType !== 'All Types') {
      conditions.push('productType == $productType');
      params.productType = productType;
    }

    if (vendor && vendor !== 'All Vendors') {
      conditions.push('vendor == $vendor');
      params.vendor = vendor;
    }

    const where = conditions.join(' && ');

    // Run both queries in parallel: paginated slice + total count
    const [products, total] = await Promise.all([
      client.fetch(
        `*[${where}] | order(_createdAt desc) [${offset}...${offset + limit}]${PRODUCT_PROJECTION}`,
        params
      ),
      client.fetch(`count(*[${where}])`, params),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: { total, offset, limit, hasMore: offset + limit < total },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const body = await request.json();

    // If collectionId is empty string, set it to null
    if (body.collectionId === '') {
      body.collectionId = null;
    }

    // Generate slug from title if not provided
    if (!body.slug && body.title) {
      body.slug = slugify(body.title);
    }

    if (body.slug) {
      const existing = await client.fetch(`*[_type == "product" && slug == $slug][0]{_id}`, {
        slug: body.slug,
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: `A product with slug "${body.slug}" already exists` },
          { status: 400 }
        );
      }
    }

    const created = await client.create({ _type: 'product', ...body });
    // Purge ISR cache so the new product appears immediately on the storefront.
    revalidateTag('products');
    return NextResponse.json({ success: true, product: withTimestamps(created) }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.ids && Array.isArray(body.ids)) {
      const tx = client.transaction();
      body.ids.forEach((id) => tx.delete(id));
      await tx.commit();
      // Purge ISR cache so deleted products disappear immediately on the storefront.
      revalidateTag('products');
      return NextResponse.json(
        { success: true, message: `${body.ids.length} products deleted successfully` },
        { status: 200 }
      );
    }
    return NextResponse.json({ success: false, message: 'No product IDs provided' }, { status: 400 });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
