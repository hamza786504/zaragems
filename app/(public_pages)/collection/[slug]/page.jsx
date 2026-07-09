'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ProductCard from '../../../_components/ProductCard';

// Maps a raw product document from the API into the shape this page renders/filters on.
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

function PriceRangeSlider({ min, max, step = 500, initialMin, initialMax, onChange }) {
    const [localMin, setLocalMin] = useState(initialMin);
    const [localMax, setLocalMax] = useState(initialMax);

    // Sync with parent resets (like Clear All)
    useEffect(() => {
        setLocalMin(initialMin);
    }, [initialMin]);

    useEffect(() => {
        setLocalMax(initialMax);
    }, [initialMax]);

    const handleRelease = () => {
        onChange(localMin, localMax);
    };

    return (
        <div>
            <div className="relative w-full h-6 flex items-center mt-6">
                {/* Track Background */}
                <div className="absolute left-0 right-0 h-1 bg-secondary/20 rounded-full" />

                {/* Active Track Highlight */}
                <div
                    className="absolute h-1 bg-primary rounded-full"
                    style={{
                        left: `${((localMin - min) / (max - min)) * 100}%`,
                        right: `${100 - ((localMax - min) / (max - min)) * 100}%`
                    }}
                />

                {/* Min Range Slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localMin}
                    onChange={(e) => {
                        const val = Math.min(Number(e.target.value), localMax - step);
                        setLocalMin(val);
                    }}
                    onMouseUp={handleRelease}
                    onTouchEnd={handleRelease}
                    className="absolute w-full h-1 pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto"
                    style={{ zIndex: localMin > max - step * 2 ? 5 : 3 }}
                />

                {/* Max Range Slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localMax}
                    onChange={(e) => {
                        const val = Math.max(Number(e.target.value), localMin + step);
                        setLocalMax(val);
                    }}
                    onMouseUp={handleRelease}
                    onTouchEnd={handleRelease}
                    className="absolute w-full h-1 pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto"
                    style={{ zIndex: 4 }}
                />
            </div>

            {/* Displaying Values */}
            <div className="flex justify-between items-center text-label-sm font-semibold mt-4 text-on-surface-variant">
                <span>PKR {localMin.toLocaleString()}</span>
                <span>PKR {localMax.toLocaleString()}</span>
            </div>
        </div>
    );
}

export default function CollectionPage() {
    const params = useParams();
    const slug = params.slug;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('Featured');
    const PRODUCTS_PER_PAGE = 50; // Maximum products per page

    // Filtering States
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFabrics, setSelectedFabrics] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);

    // Price range min and max states (live filtering without Apply button)
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedFabrics, selectedSizes, minPrice, maxPrice, sortBy]);

    // Fetch collection data based on slug, always live from the database.
    // 'new-arrivals' is a virtual collection: the latest active products across
    // the whole catalog, rather than products tied to one Collection document.
    useEffect(() => {
        const fetchCollectionData = async () => {
            setLoading(true);
            try {
                const normalizedSlug = slug ? slug.toLowerCase() : '';
                let mapped = [];

                if (normalizedSlug === 'new-arrivals') {
                    const productsRes = await fetch('/api/products?status=active');
                    const productsData = await productsRes.json();
                    mapped = productsData.success ? productsData.products.map(mapProduct) : [];
                } else {
                    const collectionsRes = await fetch('/api/collections');
                    const collectionsData = await collectionsRes.json();

                    const foundCollection = collectionsData.success
                        ? collectionsData.collections.find(
                            (c) => c.slug === normalizedSlug || c.name.toLowerCase() === normalizedSlug
                        )
                        : null;

                    if (foundCollection) {
                        const productsRes = await fetch(`/api/products?collectionId=${foundCollection._id}&status=active`);
                        const productsData = await productsRes.json();
                        mapped = productsData.success ? productsData.products.map(mapProduct) : [];
                    }
                }

                setProducts(mapped);
            } catch (error) {
                console.error('Error fetching collection data:', error);
                setProducts([]);
            } finally {
                // Filter options depend on the newly loaded product set, so clear any
                // selections from a previous collection that may no longer apply.
                setSelectedFabrics([]);
                setSelectedSizes([]);
                setMinPrice('');
                setMaxPrice('');
                setLoading(false);
            }
        };

        if (slug) {
            fetchCollectionData();
        }
    }, [slug]);

    // Handle filter toggles
    const toggleFabric = (fabric) => {
        setSelectedFabrics((prev) =>
            prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
        );
    };

    const toggleSize = (size) => {
        setSelectedSizes((prev) =>
            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
        );
    };

    // Products for this collection view, straight from the database (no client-side re-filtering by slug)
    const collectionProducts = products;

    // ── Filter option lists, derived from the actual products loaded for this view ──
    const availableFabrics = useMemo(() => {
        const set = new Set(collectionProducts.map((p) => p.fabric).filter(Boolean));
        return Array.from(set).sort();
    }, [collectionProducts]);

    const availableSizes = useMemo(() => {
        const set = new Set();
        collectionProducts.forEach((p) => (p.sizes || []).forEach((s) => set.add(s)));
        return Array.from(set).sort();
    }, [collectionProducts]);

    const priceBounds = useMemo(() => {
        const prices = collectionProducts
            .map((p) => p.priceNumeric)
            .filter((p) => typeof p === 'number' && !isNaN(p));
        if (prices.length === 0) return { min: 0, max: 1000 };
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return { min, max: max > min ? max : min + 1000 };
    }, [collectionProducts]);

    const priceStep = Math.max(1, Math.round((priceBounds.max - priceBounds.min) / 40));

    const minPriceVal = minPrice !== '' ? Number(minPrice) : priceBounds.min;
    const maxPriceVal = maxPrice !== '' ? Number(maxPrice) : priceBounds.max;

    const minActive = minPriceVal > priceBounds.min;
    const maxActive = maxPriceVal < priceBounds.max;

    // Calculate active filters count
    const activeFiltersCount =
        selectedFabrics.length +
        selectedSizes.length +
        (minActive ? 1 : 0) +
        (maxActive ? 1 : 0);

    // Apply filtering logic
    const filteredProducts = collectionProducts.filter((product) => {
        // Fabric/Variant filter
        if (selectedFabrics.length > 0 && !selectedFabrics.includes(product.fabric)) {
            return false;
        }

        // Size filter
        if (
            selectedSizes.length > 0 &&
            !product.sizes.some((size) => selectedSizes.includes(size))
        ) {
            return false;
        }

        // Price range live filter (Min to Max)
        const price = product.priceNumeric;
        if (minActive && price < minPriceVal) {
            return false;
        }
        if (maxActive && price > maxPriceVal) {
            return false;
        }

        return true;
    });

    // Apply sorting logic. 'Featured' (the default) and 'Newest' both show the
    // most recently added products first, so a collection always leads with its latest arrivals.
    const sortedProducts = [...filteredProducts];
    if (sortBy === 'Price: Low to High') {
        sortedProducts.sort((a, b) => a.priceNumeric - b.priceNumeric);
    } else if (sortBy === 'Price: High to Low') {
        sortedProducts.sort((a, b) => b.priceNumeric - a.priceNumeric);
    } else {
        sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Calculate pagination
    const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
    
    // Get products for current page
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIndex = startIndex + PRODUCTS_PER_PAGE;
        return sortedProducts.slice(startIndex, endIndex);
    }, [sortedProducts, currentPage]);

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is less than max visible
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);
            
            // Adjust if we're near the beginning
            if (currentPage <= 3) {
                startPage = 2;
                endPage = Math.min(4, totalPages - 1);
            }
            
            // Adjust if we're near the end
            if (currentPage >= totalPages - 2) {
                startPage = Math.max(2, totalPages - 3);
                endPage = totalPages - 1;
            }
            
            // Add ellipsis after first page if needed
            if (startPage > 2) {
                pages.push('...');
            }
            
            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            
            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
                pages.push('...');
            }
            
            // Always show last page if more than 1 page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    // Handle page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            // Scroll to top of product grid
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Shared Filter Content Sidebar component
    const FilterSidebarContent = () => (
        <div className="flex flex-col space-y-8 bg-surface p-1 md:p-0">
            {/* Fabric / Variant Filter */}
            {availableFabrics.length > 0 && (
                <div>
                    <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-4 font-semibold pb-2 border-b border-secondary/10">
                        Fabric / Variant
                    </h3>
                    <div className="flex flex-col space-y-3">
                        {availableFabrics.map((fabric) => {
                            const isSelected = selectedFabrics.includes(fabric);
                            return (
                                <label key={fabric} className="flex items-center space-x-3 text-label-sm text-on-surface-variant cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleFabric(fabric)}
                                        className="rounded border-secondary/30 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                    />
                                    <span className="group-hover:text-secondary transition-colors font-medium">{fabric}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Size Filter */}
            {availableSizes.length > 0 && (
                <div>
                    <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-4 font-semibold pb-2 border-b border-secondary/10">
                        Size
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => {
                            const isSelected = selectedSizes.includes(size);
                            return (
                                <button
                                    key={size}
                                    onClick={() => toggleSize(size)}
                                    className={`w-10 h-10 flex items-center justify-center text-label-sm font-label-sm border rounded-sm transition-all font-semibold ${isSelected
                                            ? 'bg-primary text-white border-primary shadow-sm'
                                            : 'border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary'
                                        }`}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Price Range Filter (Dual Range Slider) */}
            {collectionProducts.length > 0 && (
                <div>
                    <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-4 font-semibold pb-2 border-b border-secondary/10">
                        Price Range
                    </h3>

                    <PriceRangeSlider
                        min={priceBounds.min}
                        max={priceBounds.max}
                        step={priceStep}
                        initialMin={minPriceVal}
                        initialMax={maxPriceVal}
                        onChange={(newMin, newMax) => {
                            setMinPrice(newMin);
                            setMaxPrice(newMax);
                        }}
                    />
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-40 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-on-surface-variant font-label-md">Loading products...</p>
            </div>
        );
    }

    // Calculate display range for current page
    const startProduct = sortedProducts.length === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
    const endProduct = Math.min(currentPage * PRODUCTS_PER_PAGE, sortedProducts.length);

    return (
        <>
            {/* Collection Header */}
            <header className="relative w-full h-[220px] md:h-[300px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        alt=""
                        className="object-cover opacity-30 grayscale-[20%]"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDg0YtbfPu0BLg_QDj8oN1HUo3GwLTnHmhOl9DwaiRpHXZW_HcrozwpjdSNavSQXCvCJH1h2Q6CBjhi1dwTgiwgFE8RUQ0YqJvaSaw3OcU1MXPxw1G5pYWcG2KKl15fAncZvR19aeTgU9d2OTyUm5MhmTBq9pmBt1ZgIOf7siIAsiyaKLUgdAHqcqICxlAgazZKDmipXP-LpAtXEKHF9sV-FC0-UMhFfDjsfd4raaVaHwYt7_KatUVijnauUXLhtGGiUGrG_jqhxxrg"
                        fill
                        sizes="100vw"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/80" />
                </div>
                <div className="relative z-10 text-center px-margin-mobile">
                    <h1 className="font-display-lg text-[32px] md:text-display-lg text-primary mb-2 capitalize leading-tight">
                        {slug ? slug.replace(/-/g, ' ') : 'Collection'}
                    </h1>
                    <p className="font-body-md text-sm md:text-body-md text-on-surface-variant max-w-[500px] mx-auto leading-relaxed">
                        Discover our latest curation of exquisite Eastern attire, where traditional craftsmanship meets modern silhouettes.
                    </p>
                </div>
            </header>

            {/* Filter & Sort Bar */}
            <section className="sticky top-[73px] md:top-[88px] z-40 bg-surface/95 backdrop-blur-md border-b border-secondary/10">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4 flex items-center justify-between gap-4">
                    {/* Left: Mobile Filter trigger */}
                    <div className="flex items-center">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden flex items-center space-x-2 cursor-pointer bg-transparent border-none outline-none"
                            aria-label="Toggle Filters"
                        >
                            <span className="material-symbols-outlined text-on-surface-variant !text-[24px]">
                                tune
                            </span>
                            <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant font-bold">
                                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                            </span>
                        </button>
                        <span className="hidden md:inline font-label-md text-label-md text-on-surface-variant/80 uppercase tracking-widest">
                            Shop The Collection
                        </span>
                    </div>

                    {/* Right: Sort options & Product Count */}
                    <div className="flex items-center space-x-4">
                        <span className="font-label-md text-[13px] md:text-label-md text-on-surface-variant/60 uppercase">
                            Sort By:
                        </span>
                        <select
                            className="bg-transparent border-none focus:ring-0 font-label-md text-[13px] md:text-label-md text-primary cursor-pointer pr-6 py-0 focus:outline-none"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option>Featured</option>
                            <option>Newest</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                        <div className="h-6 w-[1px] bg-secondary/20" />
                        <p className="font-label-sm text-[12px] md:text-label-sm text-on-surface-variant whitespace-nowrap">
                            {sortedProducts.length > 0 
                                ? `Showing ${startProduct}-${endProduct} of ${sortedProducts.length}`
                                : `Showing 0 of ${collectionProducts.length}`}
                        </p>
                    </div>
                </div>
            </section>

            {/* Mobile Filter Drawer Overlay */}
            {showFilters && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
                    onClick={() => setShowFilters(false)}
                />
            )}

            {/* Mobile Filter Drawer (Slides from left) */}
            <div className={`fixed top-0 left-0 bottom-0 z-55 w-[80%] max-w-[360px] bg-surface shadow-2xl p-6 transition-transform duration-300 ease-in-out transform md:hidden ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between border-b border-secondary/25 pb-4 mb-6">
                    <span className="text-headline-sm font-headline-md text-primary uppercase tracking-wider font-bold">Filters</span>
                    <button
                        onClick={() => setShowFilters(false)}
                        className="text-primary hover:text-secondary focus:outline-none flex items-center justify-center bg-transparent border-none"
                        aria-label="Close Filters"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-140px)] pr-2">
                    <FilterSidebarContent />
                </div>
                {/* Reset button inside Drawer */}
                {activeFiltersCount > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-surface border-t border-secondary/15">
                        <button
                            onClick={() => {
                                setSelectedFabrics([]);
                                setSelectedSizes([]);
                                setMinPrice('');
                                setMaxPrice('');
                                setShowFilters(false);
                            }}
                            className="w-full bg-primary text-white py-3 text-label-md uppercase tracking-wider hover:bg-primary-container font-semibold"
                        >
                            Reset Filters ({activeFiltersCount})
                        </button>
                    </div>
                )}
            </div>

            {/* Two-Column Responsive E-Commerce Layout */}
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md md:py-stack-lg flex flex-col md:flex-row gap-10">

                {/* 1. Left Sidebar: Persistent on Desktop, hidden on Mobile */}
                <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0 border-r border-secondary/10 pr-8">
                    <FilterSidebarContent />
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={() => {
                                setSelectedFabrics([]);
                                setSelectedSizes([]);
                                setMinPrice('');
                                setMaxPrice('');
                            }}
                            className="mt-6 w-full text-center text-label-sm uppercase tracking-widest text-secondary hover:text-primary transition-colors font-bold border border-secondary/20 py-2.5 rounded-sm hover:border-secondary"
                        >
                            Clear All ({activeFiltersCount})
                        </button>
                    )}
                </aside>

                {/* 2. Main content area: Active Filters Row & Product Grid */}
                <main className="flex-grow">

                    {/* Active Filters Row */}
                    {activeFiltersCount > 0 && (
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-secondary/10 pb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-label-sm font-label-sm text-on-surface-variant/60 mr-2">Active Filters:</span>
                                {selectedFabrics.map((fabric) => (
                                    <span key={fabric} className="inline-flex items-center gap-1.5 bg-surface-container px-3 py-1 text-label-sm font-medium border border-secondary/15 rounded-sm">
                                        {fabric}
                                        <button onClick={() => toggleFabric(fabric)} className="hover:text-error transition-colors font-bold text-[11px] leading-none ml-1 bg-transparent border-none">✕</button>
                                    </span>
                                ))}
                                {selectedSizes.map((size) => (
                                    <span key={size} className="inline-flex items-center gap-1.5 bg-surface-container px-3 py-1 text-label-sm font-medium border border-secondary/15 rounded-sm">
                                        Size: {size}
                                        <button onClick={() => toggleSize(size)} className="hover:text-error transition-colors font-bold text-[11px] leading-none ml-1 bg-transparent border-none">✕</button>
                                    </span>
                                ))}
                                {minPrice && (
                                    <span className="inline-flex items-center gap-1.5 bg-surface-container px-3 py-1 text-label-sm font-medium border border-secondary/15 rounded-sm">
                                        Min: PKR {parseInt(minPrice).toLocaleString()}
                                        <button onClick={() => setMinPrice('')} className="hover:text-error transition-colors font-bold text-[11px] leading-none ml-1 bg-transparent border-none">✕</button>
                                    </span>
                                )}
                                {maxPrice && (
                                    <span className="inline-flex items-center gap-1.5 bg-surface-container px-3 py-1 text-label-sm font-medium border border-secondary/15 rounded-sm">
                                        Max: PKR {parseInt(maxPrice).toLocaleString()}
                                        <button onClick={() => setMaxPrice('')} className="hover:text-error transition-colors font-bold text-[11px] leading-none ml-1 bg-transparent border-none">✕</button>
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedFabrics([]);
                                    setSelectedSizes([]);
                                    setMinPrice('');
                                    setMaxPrice('');
                                }}
                                className="text-label-md font-label-md text-secondary hover:underline bg-transparent border-none cursor-pointer"
                            >
                                Clear All
                            </button>
                        </div>
                    )}

                    {/* Products Grid */}
                    {paginatedProducts.length === 0 ? (
                        <div className="text-center py-20 bg-surface-container-lowest border border-secondary/10 rounded-sm">
                            <span className="material-symbols-outlined text-outline text-5xl mb-4">
                                info
                            </span>
                            <h3 className="font-headline-sm text-headline-sm text-primary mb-2">No Products Found</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant mx-auto mb-6">
                                No products match your selected filters. Try adjusting your filter parameters or resetting.
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedFabrics([]);
                                    setSelectedSizes([]);
                                    setMinPrice('');
                                    setMaxPrice('');
                                }}
                                className="bg-primary text-white font-label-md px-8 py-3 uppercase tracking-wider hover:bg-primary-container transition-all"
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 animate-fade-in-up gap-y-4">
                            {paginatedProducts.map((product) => (
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

                    {/* Dynamic Pagination */}
                    {sortedProducts.length > PRODUCTS_PER_PAGE && (
                        <nav className="flex justify-center items-center mt-stack-lg space-x-2">
                            {/* Previous Page Button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`w-10 h-10 flex items-center justify-center border transition-all ${
                                    currentPage === 1
                                        ? 'border-secondary/10 text-on-surface-variant/30 cursor-not-allowed'
                                        : 'border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary'
                                }`}
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>

                            {/* Page Numbers */}
                            {getPageNumbers().map((page, index) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="px-2 text-on-surface-variant">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={`page-${page}`}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-10 h-10 flex items-center justify-center transition-all font-label-md ${
                                            currentPage === page
                                                ? 'bg-secondary text-white'
                                                : 'border border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}

                            {/* Next Page Button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`w-10 h-10 flex items-center justify-center border transition-all ${
                                    currentPage === totalPages
                                        ? 'border-secondary/10 text-on-surface-variant/30 cursor-not-allowed'
                                        : 'border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary'
                                }`}
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </nav>
                    )}

                    {/* Page Info (Optional) */}
                    {sortedProducts.length > 0 && (
                        <div className="text-center mt-4 text-label-sm text-on-surface-variant/60">
                            Page {currentPage} of {totalPages} ({sortedProducts.length} total products)
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}