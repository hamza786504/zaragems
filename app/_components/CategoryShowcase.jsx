'use client';

import { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

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

export default function CategoryShowcase({ collections: serverCollections = null, initialProducts = null }) {
    const [collections, setCollections] = useState(serverCollections || []);
    const [collectionsLoading, setCollectionsLoading] = useState(!serverCollections);
    const [activeTab, setActiveTab] = useState(null);
    const [products, setProducts] = useState(initialProducts || []);
    const [productsLoading, setProductsLoading] = useState(!initialProducts);
    const cache = useRef({});

    useEffect(() => {
        if (serverCollections && serverCollections.length > 0) {
            const first = serverCollections[0];
            setActiveTab(first.slug);
            if (initialProducts) {
                cache.current[first.slug] = initialProducts;
                setProducts(initialProducts);
                setProductsLoading(false);
            }
            return;
        }
        const load = async () => {
            try {
                const res = await fetch('/api/collections');
                const data = await res.json();
                const cols = data.success ? data.collections : [];
                setCollections(cols);
                if (cols.length > 0) {
                    const first = cols[0];
                    setActiveTab(first.slug);
                    if (initialProducts) {
                        cache.current[first.slug] = initialProducts;
                        setProducts(initialProducts);
                    } else {
                        loadProducts(first.slug);
                    }
                }
            } catch (err) {
                console.error('[CategoryShowcase] failed to load collections:', err);
            } finally {
                setCollectionsLoading(false);
                if (initialProducts) setProductsLoading(false);
            }
        };
        if (!serverCollections) load();
    }, []);

    const loadProducts = async (slug) => {
        if (cache.current[slug]) {
            setProducts(cache.current[slug]);
            setProductsLoading(false);
            return;
        }
        setProductsLoading(true);
        try {
            const res = await fetch(`/api/showcase?collectionSlug=${encodeURIComponent(slug)}`);
            const data = await res.json();
            const result = data.success ? data.products : [];
            cache.current[slug] = result;
            setProducts(result);
        } catch (err) {
            console.error('[CategoryShowcase] fetch error:', err);
            cache.current[slug] = [];
            setProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    const handleTabClick = (slug) => {
        if (slug === activeTab) return;
        setActiveTab(slug);
        loadProducts(slug);
    };

    if (collections.length === 0 && !collectionsLoading) {
        return (
            <section className="py-2 bg-surface-bright">
                <div className="px-4 text-center py-16 text-on-surface-variant">
                    <h2 className="text-base md:text-headline-lg font-bold font-headline-md text-primary mb-4">Our Collections</h2>
                    <p>No collections available yet. Add collections in the admin panel.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-2 bg-surface-bright">
            <div className="px-4">
                <div className="text-center mb-4">
                    <h2 className="text-base md:text-headline-lg font-bold font-headline-md text-primary mb-4">
                        Our Collections
                    </h2>
                    <p className="text-label-md font-label-md text-secondary tracking-widest uppercase">
                        Timeless Elegance in Every Thread
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 mb-1 border-b border-secondary/20 pb-6">
                    {collections.map((col) => (
                        <button
                            key={col.slug}
                            aria-selected={activeTab === col.slug}
                            role="tab"
                            className={`text-label-lg font-label-md cursor-pointer transition-colors ${
                                activeTab === col.slug
                                    ? 'text-primary border-b-2 border-secondary pb-2 font-bold'
                                    : 'border-b-2 border-transparent text-on-surface-variant hover:text-secondary'
                            }`}
                            onClick={() => handleTabClick(col.slug)}
                        >
                            {col.name}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-1 gap-y-1">
                    {productsLoading || collectionsLoading ? (
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
                        <div className="col-span-4 py-16 text-center text-on-surface-variant text-body-md font-body-md">
                            No products found in{' '}
                            <span className="font-semibold text-primary">
                                {collections.find((c) => c.slug === activeTab)?.name || 'this collection'}
                            </span>.
                            <br />
                            <span className="text-sm opacity-70">
                                Add products to this collection in the admin panel.
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-16 flex justify-center">
                    <button className="border border-primary text-primary px-6 py-4 font-label-md uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300 text-sm">
                        SEE MORE
                    </button>
                </div>
            </div>
        </section>
    );
}
