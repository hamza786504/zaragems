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

export const revalidate = 300;  // ISR: re-render at most every 5 min on the server

export const metadata = {
    title: 'Zaragems | Luxury Jewellery & Accessories',
    description: 'Discover handcrafted rings, handchains, earrings and accessories from Zaragems.',
};

export default async function Home() {
    // Fetch only the default tab's products server-side.
    // Cached by unstable_cache (tag: 'products') → instant on every CDN edge hit.
    // Non-default tabs (Handchain, Earrings, Accessories) remain lazy-loaded.
    const initialShowcaseProducts = await getShowcaseProducts('Rings');

    return (
        <main>
            {/* Zero-render client island — attaches scroll + IntersectionObserver */}
            <ScrollAnimations />

            <HeroCarousel />
            <NewArrivals />
            {/* initialProducts pre-seeds the default tab — no skeleton on first paint */}
            <CategoryShowcase initialProducts={initialShowcaseProducts} />
            <HandcraftedCategories />
            <FeaturedProducts />
            <HandcraftedAccessories />
            <Testimonials />
            <BrandStory />
            <Newsletter />
        </main>
    );
}