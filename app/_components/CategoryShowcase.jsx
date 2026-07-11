'use client';
// CategoryShowcase.jsx
//
// Rendering strategy:
//   • Default tab (Rings): receives pre-fetched `initialProducts` from the
//     parent Server Component — renders real cards immediately, zero skeleton.
//   • Other tabs: lazy-fetched from /api/showcase only on first click, then
//     kept in a useRef cache so switching back is instant (zero network).

import { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

const TABS = ['Rings', 'Handchain', 'Earrings', 'Accessories'];
const DEFAULT_TAB = TABS[0];

// Skeleton shown only for non-default tabs while their data loads.
function ProductSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="bg-surface-container-high" style={{ aspectRatio: '3/4' }} />
            <div className="mt-3 space-y-2 px-1">
                <div className="h-3 bg-surface-container-high rounded w-1/3" />
                <div className="h-4 bg-surface-container-high rounded w-2/3" />
                <div className="h-4 bg-surface-container-high rounded w-1/4" />
            </div>
        </div>
    );
}

// `initialProducts` is provided by the parent Server Component (ISR pre-fetch).
//   • When present: renders real cards immediately — no mount fetch, no skeleton.
//   • When absent (e.g. rendered standalone): falls back to client-side fetch.
export default function CategoryShowcase({ initialProducts = null }) {
    const [activeTab, setActiveTab] = useState(DEFAULT_TAB);
    const cache = useRef({});

    // If initialProducts is provided, seed the cache and render immediately.
    // `null` means "not provided" (fallback to client fetch).
    // `[]` means "server fetched and found 0 results" — still a valid state.
    const hasInitial = initialProducts !== null;
    const [products, setProducts] = useState(hasInitial ? initialProducts : []);
    const [loading, setLoading] = useState(!hasInitial);

    useEffect(() => {
        // Seed the in-memory cache with the server-provided data so switching
        // away from and back to Rings never makes a network request.
        if (hasInitial) {
            cache.current[DEFAULT_TAB] = initialProducts;
        } else {
            // No server data — fetch on mount (fallback path)
            loadTab(DEFAULT_TAB);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadTab = async (tab) => {
        // Cache hit: instant switch, zero network
        if (cache.current[tab]) {
            setProducts(cache.current[tab]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // /api/showcase responds with Cache-Control: s-maxage=300
            // so CDN edge serves this without hitting the server.
            const res = await fetch(`/api/showcase?category=${encodeURIComponent(tab)}`);
            const data = await res.json();
            const result = data.success ? data.products : [];
            cache.current[tab] = result;
            setProducts(result);
        } catch (err) {
            console.error('[CategoryShowcase] fetch error:', err);
            cache.current[tab] = [];
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTabClick = (tab) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        loadTab(tab);
    };

    return (
        <section className="py-2 bg-surface-bright">
            <div className="px-4">
                {/* Header */}
                <div className="text-center mb-4">
                    <h2 className="text-display-lg-mobile md:text-headline-lg font-bold font-headline-md text-primary mb-4">
                        Our Collections
                    </h2>
                    <p className="text-label-md font-label-md text-secondary tracking-widest uppercase">
                        Timeless Elegance in Every Thread
                    </p>
                </div>

                {/* Tab bar */}
                <div className="flex flex-wrap justify-center gap-8 mb-1 border-b border-secondary/20 pb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            aria-selected={activeTab === tab}
                            role="tab"
                            className={`text-label-lg font-label-md cursor-pointer transition-colors ${
                                activeTab === tab
                                    ? 'text-primary border-b-2 border-secondary pb-2 font-bold'
                                    : 'border-b-2 border-transparent text-on-surface-variant hover:text-secondary'
                            }`}
                            onClick={() => handleTabClick(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1 gap-y-1">
                    {loading ? (
                        // Skeleton only shown for non-default tabs on first click
                        Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
                    ) : products.length > 0 ? (
                        products.map((product) => (
                            <ProductCard
                                key={product._id || product.id}
                                id={product._id || product.id}
                                title={product.title}
                                price={product.price}
                                priceNumeric={product.priceNumeric}
                                image={product.image || product.primaryImage || ''}
                                slug={product.slug}
                                type={product.type}
                                sizes={product.sizes || []}
                                colors={product.colors || []}
                                isAccessory={product.isAccessory}
                            />
                        ))
                    ) : (
                        // Empty state — add products in Sanity with this productType
                        <div className="col-span-4 py-16 text-center text-on-surface-variant text-body-md font-body-md">
                            No products found for{' '}
                            <span className="font-semibold text-primary">{activeTab}</span>.
                            <br />
                            <span className="text-sm opacity-70">
                                Add products in the admin panel with this category.
                            </span>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="mt-16 flex justify-center">
                    <button className="border border-primary text-primary px-6 py-4 font-label-md uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300 text-sm">
                        SEE MORE
                    </button>
                </div>
            </div>
        </section>
    );
}