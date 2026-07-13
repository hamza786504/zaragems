// app/(public_pages)/page.jsx  ← Server Component (no 'use client')
//
// ISR strategy:
//   • Pre-rendered at build time, cached on CDN edge for 5 minutes
//   • Admin product mutations call revalidateTag('products') → instant cache purge
//   • CategoryShowcase receives initialProducts as a prop → no skeleton flash on first paint
//   • Other showcase tabs fetch lazily client-side only when the user clicks them

import HeroCarousel from '../_components/HeroCarousel';
import NewArrivals from '../_components/NewArrivals';
import CategoryShowcase from '../_components/CategoryShowcase';
import HandcraftedCategories from '../_components/HandcraftedCategories';
import BrandStory from '../_components/BrandStory';
import FeaturedProducts from '../_components/FeaturedProducts';
import HandcraftedAccessories from '../_components/HandcraftedAccessories';
import Newsletter from '../_components/Newsletter';
import Testimonials from '../_components/Testimonials';
import ScrollAnimations from '../_components/ScrollAnimations';
import { getShowcaseProducts } from '@/lib/getShowcaseProducts';
import { publicClient } from '@/lib/sanityClientPublic';

export const revalidate = 300;

export const metadata = {
    title: 'Zaragems | Luxury Jewellery & Accessories',
    description: 'Discover handcrafted rings, handchains, earrings and accessories from Zaragems.',
};

export default async function Home() {
    const SHOWCASE_SLUGS = ['rings-collection', 'handcuff-bracelets', 'pendants-malaset'];
    const collections = await publicClient.fetch(
        `*[_type == "collection" && slug in $slugs] | order(name asc){slug, name, _id}`,
        { slugs: SHOWCASE_SLUGS }
    );
    const firstCollection = collections[0];
    const initialShowcaseProducts = firstCollection
        ? await getShowcaseProducts(firstCollection.slug)
        : [];

    return (
        <main>
            {/* Zero-render client island — attaches scroll + IntersectionObserver */}
            <ScrollAnimations />

            <HeroCarousel />
            <NewArrivals />
            {/* collections + initialProducts pre-seed the default tab — no client fetch waterfall */}
            <CategoryShowcase collections={collections} initialProducts={initialShowcaseProducts} />
            <HandcraftedCategories />
            <FeaturedProducts collectionSlug="handcuff-baracelts" title="HandCuff/Baracelts" />
            <FeaturedProducts collectionSlug="studs-earings" title="Studs/Earings" />
            {/* <HandcraftedAccessories /> */}
            <Testimonials />
            <BrandStory />
            <Newsletter />
        </main>
    );
}