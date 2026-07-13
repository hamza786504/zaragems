import { NextResponse } from 'next/server';
import { publicClient } from '@/lib/sanityClientPublic';

const SHOWCASE_PROJECTION = `{
    _id, "id": _id, title, slug,
    "price": "PKR " + string(price), "priceNumeric": price,
    "type": productType,
    "image": coalesce(images[0], ""),
    sizes, colors, isAccessory
}`;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const collectionSlug = searchParams.get('collectionSlug');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '4', 10), 1), 20);

    if (!collectionSlug) {
        return NextResponse.json({ success: false, error: 'collectionSlug is required' }, { status: 400 });
    }

    try {
        const collection = await publicClient.fetch(
            `*[_type == "collection" && slug == $slug][0]{ _id }`,
            { slug: collectionSlug }
        );
        if (!collection) {
            return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 });
        }
        const products = await publicClient.fetch(
            `*[_type == "product" && status == "active" && collectionId == $collectionId] | order(_createdAt desc) [0...${limit}] ${SHOWCASE_PROJECTION}`,
            { collectionId: collection._id }
        );
        return NextResponse.json(
            { success: true, products: products || [] },
            { status: 200, headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=30' } }
        );
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
