'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ProductCard from '../../../_components/ProductCard';

const PAGE_SIZE = 20;

function mapProduct(p) {
    return {
        id: p._id,
        _id: p._id,
        title: p.title,
        slug: p.slug,
        price: `PKR ${Number(p.price).toLocaleString()}`,
        priceNumeric: p.price,
        type: p.productType || 'Product',
        fabric: p.productType || 'Product',
        sizes: p.sizes || [],
        colors: p.colors || [],
        createdAt: p.createdAt,
        primaryImage: p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=700&fit=crop',
    };
}

// ── Price Range Slider ────────────────────────────────────────────────────────
function PriceRangeSlider({ min, max, step = 500, initialMin, initialMax, onChange }) {
    const [localMin, setLocalMin] = useState(initialMin);
    const [localMax, setLocalMax] = useState(initialMax);

    useEffect(() => { setLocalMin(initialMin); }, [initialMin]);
    useEffect(() => { setLocalMax(initialMax); }, [initialMax]);

    const handleRelease = () => onChange(localMin, localMax);

    return (
        <div>
            <div className="relative w-full h-6 flex items-center mt-6">
                <div className="absolute left-0 right-0 h-1 bg-secondary/20 rounded-full" />
                <div
                    className="absolute h-1 bg-primary rounded-full"
                    style={{
                        left: `${((localMin - min) / (max - min)) * 100}%`,
                        right: `${100 - ((localMax - min) / (max - min)) * 100}%`,
                    }}
                />
                <input type="range" min={min} max={max} step={step} value={localMin}
                    onChange={(e) => setLocalMin(Math.min(Number(e.target.value), localMax - step))}
                    onMouseUp={handleRelease} onTouchEnd={handleRelease}
                    className="absolute w-full h-1 pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto"
                    style={{ zIndex: localMin > max - step * 2 ? 5 : 3 }}
                />
                <input type="range" min={min} max={max} step={step} value={localMax}
                    onChange={(e) => setLocalMax(Math.max(Number(e.target.value), localMin + step))}
                    onMouseUp={handleRelease} onTouchEnd={handleRelease}
                    className="absolute w-full h-1 pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto"
                    style={{ zIndex: 4 }}
                />
            </div>
            <div className="flex justify-between items-center text-label-sm font-semibold mt-4 text-on-surface-variant">
                <span>PKR {localMin.toLocaleString()}</span>
                <span>PKR {localMax.toLocaleString()}</span>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CollectionPage() {
    const { slug } = useParams();

    // Server-paginated products list
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    // collectionId resolved from slug (null = new-arrivals virtual collection)
    const [collectionId, setCollectionId] = useState(undefined); // undefined = not resolved yet

    // Client-side filter state (applied on top of loaded data)
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFabrics, setSelectedFabrics] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('Featured');

    const sentinelRef = useRef(null);

    // ── Step 1: Resolve collection → collectionId ─────────────────────
    useEffect(() => {
        if (!slug) return;
        const normalizedSlug = slug.toLowerCase();

        if (normalizedSlug === 'new-arrivals') {
            setCollectionId(null); // virtual — use status=active, no collectionId filter
            return;
        }

        fetch('/api/collections')
            .then(r => r.json())
            .then(data => {
                const found = data.success
                    ? data.collections.find(c => c.slug === normalizedSlug || c.name.toLowerCase() === normalizedSlug)
                    : null;
                setCollectionId(found ? found._id : ''); // '' = collection not found
            })
            .catch(() => setCollectionId(''));
    }, [slug]);

    // ── Step 2: Initial product load once collectionId is resolved ────
    const loadInitial = useCallback(async (resolvedId) => {
        setLoading(true);
        setProducts([]);
        setOffset(0);
        setHasMore(true);

        const p = new URLSearchParams({ limit: PAGE_SIZE, offset: 0, status: 'active' });
        if (resolvedId) p.set('collectionId', resolvedId);  // null → skip (new-arrivals)

        try {
            const res = await fetch(`/api/products?${p}`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.products.map(mapProduct));
                setTotal(data.pagination?.total ?? data.products.length);
                setHasMore(data.pagination?.hasMore ?? false);
                setOffset(PAGE_SIZE);
            }
        } catch (err) {
            console.error('[collection] initial fetch error:', err);
        } finally {
            setLoading(false);
            // Clear client filters when collection changes
            setSelectedFabrics([]);
            setSelectedSizes([]);
            setMinPrice('');
            setMaxPrice('');
        }
    }, []);

    useEffect(() => {
        // Wait until collectionId is resolved (undefined = still resolving)
        if (collectionId === undefined) return;
        loadInitial(collectionId);
    }, [collectionId, loadInitial]);

    // ── Step 3: Load next chunk on scroll ────────────────────────────
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || collectionId === undefined) return;
        setLoadingMore(true);

        const p = new URLSearchParams({ limit: PAGE_SIZE, offset, status: 'active' });
        if (collectionId) p.set('collectionId', collectionId);

        try {
            const res = await fetch(`/api/products?${p}`);
            const data = await res.json();
            if (data.success) {
                setProducts(prev => [...prev, ...data.products.map(mapProduct)]);
                setHasMore(data.pagination?.hasMore ?? false);
                setOffset(prev => prev + PAGE_SIZE);
            }
        } catch (err) {
            console.error('[collection] loadMore error:', err);
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore, offset, collectionId]);

    // IntersectionObserver triggers loadMore when sentinel enters viewport
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) loadMore(); },
            { rootMargin: '300px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [loadMore]);

    // ── Client-side filters (applied on loaded data) ──────────────────
    const toggleFabric = (f) => setSelectedFabrics(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
    const toggleSize = (s) => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

    const availableFabrics = useMemo(() => [...new Set(products.map(p => p.fabric).filter(Boolean))].sort(), [products]);
    const availableSizes = useMemo(() => {
        const s = new Set(); products.forEach(p => p.sizes.forEach(sz => s.add(sz))); return [...s].sort();
    }, [products]);

    const priceBounds = useMemo(() => {
        const prices = products.map(p => p.priceNumeric).filter(n => typeof n === 'number' && !isNaN(n));
        if (!prices.length) return { min: 0, max: 1000 };
        const mn = Math.min(...prices), mx = Math.max(...prices);
        return { min: mn, max: mx > mn ? mx : mn + 1000 };
    }, [products]);

    const priceStep = Math.max(1, Math.round((priceBounds.max - priceBounds.min) / 40));
    const minPriceVal = minPrice !== '' ? Number(minPrice) : priceBounds.min;
    const maxPriceVal = maxPrice !== '' ? Number(maxPrice) : priceBounds.max;
    const minActive = minPriceVal > priceBounds.min;
    const maxActive = maxPriceVal < priceBounds.max;
    const activeFiltersCount = selectedFabrics.length + selectedSizes.length + (minActive ? 1 : 0) + (maxActive ? 1 : 0);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            if (selectedFabrics.length > 0 && !selectedFabrics.includes(p.fabric)) return false;
            if (selectedSizes.length > 0 && !p.sizes.some(s => selectedSizes.includes(s))) return false;
            if (minActive && p.priceNumeric < minPriceVal) return false;
            if (maxActive && p.priceNumeric > maxPriceVal) return false;
            return true;
        });
    }, [products, selectedFabrics, selectedSizes, minActive, maxActive, minPriceVal, maxPriceVal]);

    const sortedProducts = useMemo(() => {
        const arr = [...filteredProducts];
        if (sortBy === 'Price: Low to High') arr.sort((a, b) => a.priceNumeric - b.priceNumeric);
        else if (sortBy === 'Price: High to Low') arr.sort((a, b) => b.priceNumeric - a.priceNumeric);
        else arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return arr;
    }, [filteredProducts, sortBy]);

    const resetFilters = () => { setSelectedFabrics([]); setSelectedSizes([]); setMinPrice(''); setMaxPrice(''); };

    // ── Filter Sidebar Content ────────────────────────────────────────
    const FilterSidebarContent = () => (
        <div className="flex flex-col space-y-8 bg-surface p-1 md:p-0">
            {availableFabrics.length > 0 && (
                <div>
                    <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-4 font-semibold pb-2 border-b border-secondary/10">variant</h3>
                    <div className="flex flex-col space-y-3">
                        {availableFabrics.map(fabric => (
                            <label key={fabric} className="flex items-center space-x-3 text-label-sm text-on-surface-variant cursor-pointer group">
                                <input type="checkbox" checked={selectedFabrics.includes(fabric)} onChange={() => toggleFabric(fabric)} className="rounded border-secondary/30 text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                                <span className="group-hover:text-secondary transition-colors font-medium">{fabric}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
            {availableSizes.length > 0 && (
                <div>
                    <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-4 font-semibold pb-2 border-b border-secondary/10">Size</h3>
                    <div className="flex flex-wrap gap-2">
                        {availableSizes.map(size => (
                            // mornally the box should be square but based on the content in it width can be updated
                            <button key={size} onClick={() => toggleSize(size)} className={`px-2 w-auto min-w-10 h-10 flex items-center justify-center text-label-sm font-label-sm border rounded-sm transition-all font-semibold ${selectedSizes.includes(size) ? 'bg-primary text-white border-primary shadow-sm' : 'border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary'}`}>
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {products.length > 0 && (
                <div>
                    <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-4 font-semibold pb-2 border-b border-secondary/10">Price Range</h3>
                    <PriceRangeSlider min={priceBounds.min} max={priceBounds.max} step={priceStep} initialMin={minPriceVal} initialMax={maxPriceVal} onChange={(a, b) => { setMinPrice(a); setMaxPrice(b); }} />
                </div>
            )}
        </div>
    );

    // ── Loading skeleton ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-40 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-on-surface-variant font-label-md">Loading products…</p>
            </div>
        );
    }

    return (
        <>
            {/* Collection Header */}
            <header className="relative w-full h-[220px] md:h-[300px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image alt="" className="object-cover opacity-30 grayscale-[20%]"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDg0YtbfPu0BLg_QDj8oN1HUo3GwLTnHmhOl9DwaiRpHXZW_HcrozwpjdSNavSQXCvCJH1h2Q6CBjhi1dwTgiwgFE8RUQ0YqJvaSaw3OcU1MXPxw1G5pYWcG2KKl15fAncZvR19aeTgU9d2OTyUm5MhmTBq9pmBt1ZgIOf7siIAsiyaKLUgdAHqcqICxlAgazZKDmipXP-LpAtXEKHF9sV-FC0-UMhFfDjsfd4raaVaHwYt7_KatUVijnauUXLhtGGiUGrG_jqhxxrg"
                        fill sizes="100vw" priority />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/80" />
                </div>
                <div className="relative z-10 text-center px-margin-mobile">
                    <h1 className="font-display-lg text-[32px] md:text-display-lg text-primary mb-2 capitalize leading-tight">
                        {slug ? slug.replace(/-/g, ' ') : 'Collection'}
                    </h1>
                    <p className="font-body-md text-xs sm:text-sm md:text-body-md text-on-surface-variant max-w-[500px] mx-auto leading-relaxed">
                        Discover our latest curation of exquisite Eastern attire, where traditional craftsmanship meets modern silhouettes.
                    </p>
                </div>
            </header>

            {/* Filter & Sort Bar */}
            <section className="sticky top-[73px] md:top-[88px] z-40 bg-surface/95 backdrop-blur-md border-b border-secondary/10">
                <div className="max-w-container-max mx-auto px-2 md:px-4 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center">
                        <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center space-x-2 cursor-pointer bg-transparent border-none outline-none" aria-label="Toggle Filters">
                            <span className="material-symbols-outlined text-on-surface-variant !text-[24px]">tune</span>
                            <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant font-bold">Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                        </button>
                        <span className="hidden md:inline font-label-md text-label-md text-on-surface-variant/80 uppercase tracking-widest">Shop The Collection</span>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <span className="font-label-md text-[10px] md:text-label-md text-on-surface-variant/60 uppercase">Sort By:</span>
                        <select className="max-w-[100px] bg-transparent border-none focus:ring-0 font-label-md text-[13px] md:text-label-md text-primary cursor-pointer pr-6 py-0 focus:outline-none" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option>Featured</option>
                            <option>Newest</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                        <div className="h-6 w-[1px] bg-secondary/20" />
                        <p className="font-label-sm text-[12px] md:text-label-sm text-on-surface-variant whitespace-nowrap">
                            {sortedProducts.length} of {total} products
                        </p>
                    </div>
                </div>
            </section>

            {/* Mobile Filter Drawer */}
            {showFilters && <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setShowFilters(false)} />}
            <div className={`fixed top-0 left-0 bottom-0 z-55 w-[80%] max-w-[360px] bg-surface shadow-2xl p-6 transition-transform duration-300 ease-in-out transform md:hidden ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between border-b border-secondary/25 pb-4 mb-6">
                    <span className="text-headline-sm font-headline-md text-primary uppercase tracking-wider font-bold">Filters</span>
                    <button onClick={() => setShowFilters(false)} className="text-primary hover:text-secondary bg-transparent border-none"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-140px)] pr-2"><FilterSidebarContent /></div>
                {activeFiltersCount > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-surface border-t border-secondary/15">
                        <button onClick={() => { resetFilters(); setShowFilters(false); }} className="w-full bg-primary text-white py-3 text-label-md uppercase tracking-wider hover:bg-primary-container font-semibold">
                            Reset Filters ({activeFiltersCount})
                        </button>
                    </div>
                )}
            </div>

            {/* Two-Column Layout */}
            <div className="max-w-container-max mx-auto px-2 py-2 flex flex-col md:flex-row gap-2">
                {/* Desktop Sidebar */}
                <aside className="ps-3 hidden md:block w-64 lg:w-72 flex-shrink-0 border-r border-secondary/10 pr-8">
                    <FilterSidebarContent />
                    {activeFiltersCount > 0 && (
                        <button onClick={resetFilters} className="mt-6 w-full text-center text-label-sm uppercase tracking-widest text-secondary hover:text-primary transition-colors font-bold border border-secondary/20 py-2.5 rounded-sm hover:border-secondary">
                            Clear All ({activeFiltersCount})
                        </button>
                    )}
                </aside>

                {/* Product Grid */}
                <main className="flex-grow">
                    {/* Active Filters Row */}
                    {activeFiltersCount > 0 && (
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-secondary/10 pb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-label-sm font-label-sm text-on-surface-variant/60 mr-2">Active Filters:</span>
                                {selectedFabrics.map(f => (
                                    <span key={f} className="inline-flex items-center gap-1.5 bg-surface-container px-3 py-1 text-label-sm font-medium border border-secondary/15 rounded-sm">
                                        {f} <button onClick={() => toggleFabric(f)} className="hover:text-error font-bold text-[11px] ml-1 bg-transparent border-none">✕</button>
                                    </span>
                                ))}
                                {selectedSizes.map(s => (
                                    <span key={s} className="inline-flex items-center gap-1.5 bg-surface-container px-3 py-1 text-label-sm font-medium border border-secondary/15 rounded-sm">
                                        Size: {s} <button onClick={() => toggleSize(s)} className="hover:text-error font-bold text-[11px] ml-1 bg-transparent border-none">✕</button>
                                    </span>
                                ))}
                                {minPrice && <span className="inline-flex items-center gap-1.5 bg-surface-container px-3 py-1 text-label-sm font-medium border border-secondary/15 rounded-sm">Min: PKR {parseInt(minPrice).toLocaleString()} <button onClick={() => setMinPrice('')} className="hover:text-error font-bold text-[11px] ml-1 bg-transparent border-none">✕</button></span>}
                                {maxPrice && <span className="inline-flex items-center gap-1.5 bg-surface-container px-3 py-1 text-label-sm font-medium border border-secondary/15 rounded-sm">Max: PKR {parseInt(maxPrice).toLocaleString()} <button onClick={() => setMaxPrice('')} className="hover:text-error font-bold text-[11px] ml-1 bg-transparent border-none">✕</button></span>}
                            </div>
                            <button onClick={resetFilters} className="text-label-md font-label-md text-secondary hover:underline bg-transparent border-none cursor-pointer">Clear All</button>
                        </div>
                    )}

                    {sortedProducts.length === 0 ? (
                        <div className="text-center py-20 bg-surface-container-lowest border border-secondary/10 rounded-sm">
                            <span className="material-symbols-outlined text-outline text-5xl mb-4">info</span>
                            <h3 className="font-headline-sm text-headline-sm text-primary mb-2">No Products Found</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant mx-auto mb-6">No products match your selected filters.</p>
                            <button onClick={resetFilters} className="bg-primary text-white font-label-md px-8 py-3 uppercase tracking-wider hover:bg-primary-container transition-all">Reset Filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 animate-fade-in-up gap-y-4">
                            {sortedProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    slug={product.slug}
                                    title={product.title}
                                    price={product.price}
                                    priceNumeric={product.priceNumeric}
                                    image={product.primaryImage}
                                    type={product.type}
                                    sizes={product.sizes}
                                    colors={product.colors}
                                />
                            ))}
                        </div>
                    )}

                    {/* Infinite scroll sentinel */}
                    <div ref={sentinelRef} className="py-8 text-center">
                        {loadingMore && (
                            <div className="flex items-center justify-center gap-3 text-on-surface-variant">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="font-label-md text-sm">Loading more products…</span>
                            </div>
                        )}
                        {!hasMore && products.length > 0 && (
                            <p className="text-label-sm text-on-surface-variant/50 uppercase tracking-widest">
                                All {total} products loaded
                            </p>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}