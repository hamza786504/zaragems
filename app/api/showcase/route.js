import { NextResponse } from 'next/server';
import { publicClient } from '@/lib/sanityClientPublic';

// Map of tab names → Sanity GROQ filter conditions
// Adjust the productType/category field values to match what you use in your Sanity schema.
const CATEGORY_FILTERS = {
    Rings:       `productType == "Ring"    || productType == "Rings"`,
    Handchain:   `productType == "Handchain" || productType == "Hand Chain"`,
    Earrings:    `productType == "Earring"   || productType == "Studs" || productType == "Earrings"`,
    Accessories: `isAccessory == true`,
};

// Lightweight projection — only the fields ProductCard actually needs.
// Keeping it small means Sanity CDN serves smaller JSON and the client
// parses it faster.
const SHOWCASE_PROJECTION = `{
    _id,
    "id": _id,
    title,
    slug,
    "price": "PKR " + string(price),
    "priceNumeric": price,
    "type": productType,
    "image": images[0].asset->url,
    sizes,
    colors,
    isAccessory
}`;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'Rings';

    const filter = CATEGORY_FILTERS[category];
    if (!filter) {
        return NextResponse.json({ success: false, error: 'Unknown category' }, { status: 400 });
    }

    try {
        const products = await publicClient.fetch(
            `*[_type == "product" && status == "active" && (${filter})] | order(_createdAt desc) [0...4] ${SHOWCASE_PROJECTION}`
        );

        return NextResponse.json(
            { success: true, products: products || [] },
            {
                status: 200,
                headers: {
                    // Edge/CDN cache for 5 minutes; stale-while-revalidate for another 30s
                    // so the response never blocks a user while refreshing in the background.
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=30',
                },
            }
        );
    } catch (error) {
        console.error('[showcase] Sanity fetch error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
