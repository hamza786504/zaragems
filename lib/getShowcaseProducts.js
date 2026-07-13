import { unstable_cache } from 'next/cache';
import { publicClient } from './sanityClientPublic';

const SHOWCASE_PROJECTION = `{
    _id,
    "id": _id,
    title,
    slug,
    "price": "PKR " + string(price),
    "priceNumeric": price,
    "type": productType,
    "image": coalesce(images[0], ""),
    sizes,
    colors,
    isAccessory
}`;

export const getShowcaseProducts = unstable_cache(
    async (collectionSlug) => {
        if (!collectionSlug) return [];
        try {
            const collection = await publicClient.fetch(
                `*[_type == "collection" && slug == $slug][0]{ _id }`,
                { slug: collectionSlug }
            );
            if (!collection) return [];
            const products = await publicClient.fetch(
                `*[_type == "product" && status == "active" && collectionId == $collectionId] | order(_createdAt desc) [0...4] ${SHOWCASE_PROJECTION}`,
                { collectionId: collection._id }
            );
            return products || [];
        } catch (err) {
            console.error(`[getShowcaseProducts] Error fetching collection ${collectionSlug}:`, err);
            return [];
        }
    },
    ['showcase-products'],
    { revalidate: 300, tags: ['showcase-products', 'products'] }
);
