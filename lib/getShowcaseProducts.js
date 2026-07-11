import { unstable_cache } from 'next/cache';
import { publicClient } from './sanityClientPublic';

// Map of tab labels → GROQ filter conditions.
// Update the productType values to match what you set in your Sanity admin.
export const SHOWCASE_CATEGORY_FILTERS = {
    Rings:       `productType == "Ring"      || productType == "Rings"`,
    Handchain:   `productType == "Handchain" || productType == "Hand Chain"`,
    Earrings:    `productType == "Earring"   || productType == "Studs" || productType == "Earrings"`,
    Accessories: `isAccessory == true`,
};

// Minimal GROQ projection — only the 7 fields ProductCard needs.
// Keeping it small reduces Sanity CDN payload and parse time.
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

// ISR-cached fetcher. Each unique `category` argument gets its own cache entry.
// The 'products' tag allows instant cache purge via revalidateTag('products')
// from any admin mutation handler (POST / PUT / DELETE on /api/products).
export const getShowcaseProducts = unstable_cache(
    async (category = 'Rings') => {
        const filter = SHOWCASE_CATEGORY_FILTERS[category];
        if (!filter) return [];
        try {
            const products = await publicClient.fetch(
                `*[_type == "product" && status == "active" && (${filter})] | order(_createdAt desc) [0...4] ${SHOWCASE_PROJECTION}`
            );
            return products || [];
        } catch (err) {
            console.error(`[getShowcaseProducts] Error fetching "${category}":`, err);
            return [];
        }
    },
    ['showcase-products'],  // static key prefix — category argument is appended automatically
    { revalidate: 300, tags: ['showcase-products', 'products'] }
);
