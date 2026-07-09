// components/FeaturedProducts.jsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=700&fit=crop';

export default function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lawnSlug, setLawnSlug] = useState('');

    useEffect(() => {
        const fetchLawnProducts = async () => {
            try {
                // First, get all collections to find the Lawn collection ID
                const collectionsRes = await fetch('/api/collections');
                const collectionsData = await collectionsRes.json();

                if (collectionsData.success) {
                    const lawnCollection = collectionsData.collections.find(
                        (c) => c.slug === 'lawn'
                    );

                    if (lawnCollection) {
                        setLawnSlug(lawnCollection.slug);

                        // Fetch products for this collection
                        const productsRes = await fetch(
                            `/api/products?collectionId=${lawnCollection._id}`
                        );
                        const productsData = await productsRes.json();
                        
                        if (productsData.success && productsData.products.length > 0) {
                            // Limit to 8 products and ensure they have images
                            const validProducts = productsData.products
                                .slice(0, 8)
                                .map(product => ({
                                    ...product,
                                    // Use first image from images array, or fallback to placeholder
                                    displayImage: product.images?.[0] || PLACEHOLDER_IMAGE
                                }));
                            setProducts(validProducts);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLawnProducts();
    }, []);

    if (loading) {
        return (
            <section className="py-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <h2 className="text-headline-md font-headline-md">Curated Favorites</h2>
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
        <section className="py-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="flex justify-between items-end mb-16">
                <div>
                    <h2 className="text-headline-lg font-headline-lg font-bold">Lawn</h2>
                    <p className="text-label-md font-label-md text-on-surface-variant tracking-widest uppercase mt-2">
                        Season&apos;s Most Desired
                    </p>
                </div>
                {lawnSlug && (
                    <Link
                        className="hidden md:block text-label-md font-label-md text-secondary hover:underline underline-offset-8"
                        href={`/collection/${lawnSlug}`}
                    >
                        VIEW ALL PRODUCTS
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 gap-y-4">
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
                        No Lawn products found
                    </p>
                )}
            </div>

            {products.length > 0 && lawnSlug && (
                <div className="mt-16 flex justify-center">
                    <Link
                        href={`/collection/${lawnSlug}`}
                        className="border border-primary text-primary px-6 py-4 font-label-md uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300 text-sm group "
                    >
                        SHOW MORE
                    </Link>
                </div>
            )}
        </section>
    );
}