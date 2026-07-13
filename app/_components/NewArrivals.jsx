// components/NewArrivals.jsx
'use client';
import Image from 'next/image';
import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const products = [
    {
        id: 1,
        title: 'Rings Collection',
        slug: 'rings-collection',
        image: '/rings.jpg',
    },
    {
        id: 2,
        title: 'HandCuff/Baracelts',
        slug: 'handcuff-baracelts',
        image: '/baracelts.jpg',
    },
    {
        id: 3,
        title: 'Pendants/MalaSet',
        slug: 'pendants-malaset',
        image: '/rings.jpg',
    },
    {
        id: 4,
        title: 'Studs/Earings',
        slug: 'studs-earings',
        image: '/rings.jpg',
    },
];

export default function NewArrivals() {
    const carouselRef = useRef(null);

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.offsetWidth * 0.8;
            carouselRef.current.scrollBy({
                left: direction === 'next' ? scrollAmount : -scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section className="overflow-x-hidden max-w-container-max mx-auto px-1 md:pr-0 md:ps-margin-mobile pt-5 lg:py-1">
            <div className="flex flex-col lg:flex-row gap-gutter items-center">
                {/* Left Side: Static Editorial Content */}
                <div className="w-full lg:w-4/12 flex flex-col items-start space-y-4 md:space-y-6 animate-fade-in-up">
                    <div className="inline-flex items-center px-3 py-1 bg-surface-container-high rounded-full">
                        <span className="text-label-sm font-label-sm text-on-surface-variant tracking-wider uppercase">
                            Established 1994
                        </span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="font-bold text-display-lg-mobile md:text-display-lg font-headline-md text-primary leading-tight">
                            NEW IN
                        </h1>
                        <p className="text-secondary font-label-md tracking-widest uppercase opacity-80">
                            Timeless Eastern Craftsmanship
                        </p>
                    </div>
                    <p className="text-body-base font-body-base text-on-surface-variant">
                        Refresh your wardrobe with this week&apos;s new arrivals. Discover the latest trends,
                        collection highlights, and key pieces for the season.
                    </p>
                    <Link href="/collection/rings-collection" className="text-sm group bg-primary text-on-primary px-6 py-4 font-label-xs uppercase tracking-[0.2em] w-fit transition-all duration-300 hover:bg-primary-container hover:scale-[1.02]">
                        SHOP NOW
                    </Link>
                </div>

                {/* Right Side: Product Carousel */}
                <div className="w-full lg:w-8/12 relative group">
                    <div
                        ref={carouselRef}
                        className="flex gap-1 overflow-x-auto no-scrollbar carousel-container scroll-smooth"
                    >
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/collection/${product.slug}`}
                                className="carousel-item flex-none w-1/2 md:w-1/3 group/card cursor-pointer"
                            >
                                <div className="relative overflow-hidden aspect-[0.73] bg-surface-container">
                                    <Image
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                        src={product.image}
                                        alt={product.title}
                                        width={400}
                                        height={548}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-80" />
                                    <div className="absolute bottom-6 left-6">
                                        <span className="text-white font-headline-md">{product.title}</span>
                                        <div className="h-0.5 w-0 bg-secondary transition-all duration-500 group-hover/card:w-full mt-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Navigation Controls */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-0 -right-0 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-white/90 shadow-lg text-primary hover:bg-secondary hover:text-white transition-all active:scale-95"
                            onClick={() => scrollCarousel('prev')}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-white/90 shadow-lg text-primary hover:bg-secondary hover:text-white transition-all active:scale-95"
                            onClick={() => scrollCarousel('next')}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8 flex justify-end gap-4 items-center">
                        <span className="text-label-sm font-label-sm text-outline">01 / 03</span>
                        <div className="w-32 h-px bg-outline-variant relative">
                            <div className="absolute inset-y-0 left-0 bg-secondary w-1/3" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}