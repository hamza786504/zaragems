'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=700&fit=crop';

export default function FeaturedProducts({ collectionSlug, title, initialProducts = null }) {
    const [products, setProducts] = useState(initialProducts || []);
    const [loading, setLoading] = useState(!initialProducts);
    const fetched = useRef(false);

    useEffect(() => {
        if (!collectionSlug) return;
        if (initialProducts) return;
        if (fetched.current) return;
        fetched.current = true;

        const fetchProducts = async () => {
            try {
                const res = await fetch(`/api/showcase?collectionSlug=${encodeURIComponent(collectionSlug)}&limit=8`);
                const data = await res.json();
                if (data.success) {
                    const mapped = data.products.map((p) => ({
                        ...p,
                        displayImage: p.image || PLACEHOLDER_IMAGE,
                    }));
                    setProducts(mapped);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [collectionSlug]);

    if (loading) {
        return (
            <section className="py-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <h2 className="text-headline-md font-headline-md">{title || collectionSlug}</h2>
                        <p className="text-label-md font-label-md text-on-surface-variant tracking-widest uppercase mt-2">
                            Season&apos;s Most Desired
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 gap-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-surface-container-low animate-pulse h-80 rounded" />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="p-1 max-w-container-max mx-auto">
            <div className="flex justify-between items-end mb-16">
                <div>
                    <h2 className="text-headline-lg font-headline-lg font-bold">{title || collectionSlug}</h2>
                    <p className="text-label-md font-label-md text-on-surface-variant tracking-widest uppercase mt-2">
                        Season&apos;s Most Desired
                    </p>
                </div>
                {collectionSlug && (
                    <Link
                        className="hidden md:block text-label-md font-label-md text-secondary hover:underline underline-offset-8"
                        href={`/collection/${collectionSlug}`}
                    >
                        VIEW ALL PRODUCTS
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 gap-y-2">
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard
                            key={product._id}
                            id={product._id}
                            title={product.title}
                            price={product.price}
                            priceNumeric={product.price}
                            image={product.displayImage}
                            slug={product.slug}
                            type={product.productType}
                            sizes={product.sizes}
                            colors={product.colors}
                        />
                    ))
                ) : (
                    <p className="col-span-full text-center text-on-surface-variant">
                        No products found in {title || collectionSlug}
                    </p>
                )}
            </div>

            {products.length > 0 && collectionSlug && (
                <div className="mt-16 flex justify-center">
                    <Link
                        href={`/collection/${collectionSlug}`}
                        className="border border-primary text-primary px-6 py-4 font-label-md uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300 text-sm group"
                    >
                        SHOW MORE
                    </Link>
                </div>
            )}
        </section>
    );
}
