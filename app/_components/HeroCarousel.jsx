// components/HeroCarousel.jsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const slides = [
    {
        id: 0,
        tag: 'Lawn Collection',
        title: 'The Summer Heritage',
        description: 'Discover our premium lawn series crafted for comfort and grace.',
        image:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCJQjhsUSgBD77N4rTLqm1PLq06B4ieufRNDSkI2NlOzScX5E4gprl9K9E2eVYOgRJjy6KFmzBPRt1LUOlHav9y70oTAD_qsrquKBLy3ev8ND4yA6rL3IlcB1gtQJzZ51jQ6APai3jZyI75rGiPezuozdowTw_1Rca3yAOdxlZVBtT2pWSIfIjJt55aalHfekqfN7DyxHcfu4Mt13gxisVfFEzXRPQCdtZQcdmwmgQ3geImDkwCEJlHsA',
    },
    {
        id: 1,
        tag: 'New Arrivals',
        title: 'Modern Opulence',
        description: 'The latest curation of exquisite Eastern attire is here.',
        image:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuC8zQoMgNt31NxH4LfZqXx02EwdVA-9HJj8z6vQ27QLpU8O49RGWZzvycsG8DT73zjx7ST5FZWHxUxvzkbsrE8VY8H0aK8_oO6npX5gL3pZzXX3m6HLo_lYwXlw3J_wkooOArRwCeC-mcietekVTU0_9smkgAl7Hvw8Flli2GuU0I0_OGFwWXzn8gPIMuc92hhApTAK0-X0CFLedszBjjxmIAPBp9XVclrKKYvaRjEH336ERMLVTyNVig',
    },
    {
        id: 2,
        tag: 'Handmade Bags',
        title: 'The Art of the Bag',
        description: 'Intricately embroidered clutches and potlis for your special occasions.',
        image:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBEyBg8njBeZXmpX8Us-it06OHWgzt1U-i47UijwDaumq4CCjumxl6a_zIoo2TwX5IAZh1mCmxfIR0Sebaa2sl7dBtMsdVq3tkp2c3Bvf08LR75O-A3WQRe910g9CGYpXUFzb8jWK1q6aacdbQNT1lY13V0c4xUxo-t2lp6_5eDnq3jeMEsmoUjAIpL0mnN3ts7eZxtTV8GZzd8swf8r2M6ZuivYjCOH-OhHs2Tcxn81IUzGu0j3XcF8Q',
    },
];

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(2);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <section className="relative h-screen w-full overflow-hidden bg-surface-container-low">
            <div className="h-full w-full flex flex-col md:flex-row">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`slide-item absolute inset-0 flex flex-col md:flex-row transition-opacity duration-1000 ${
                            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                        <div className="w-full md:w-[45%] h-1/2 md:h-full flex flex-col justify-center px-margin-mobile md:px-margin-desktop space-y-6 bg-surface-container-low">
                            <span className="text-label-md font-label-md text-secondary tracking-widest uppercase">
                                {slide.tag}
                            </span>
                            <h1 className="text-display-lg-mobile md:text-display-xl font-headline-xs font-bold text-primary leading-tight">
                                {slide.title}
                            </h1>
                            <p className="text-body-lg font-body-lg text-on-surface-variant">
                                {slide.description}
                            </p>
                            <Link href="/grocery" className="text-sm group bg-primary text-on-primary px-6 py-4 font-label-xs uppercase tracking-[0.2em] w-fit transition-all duration-300 hover:bg-primary-container hover:scale-[1.02]">
                                EXPLORE COLLECTION
                            </Link>
                        </div>
                        <div className="w-full md:w-[55%] h-1/2 md:h-full">
                            <Image
                                alt={slide.tag}
                                className="w-full h-full object-cover"
                                src={slide.image}
                                width={800}
                                height={600}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-4 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide ? 'bg-primary' : 'bg-primary/20'
                        }`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </section>
    );
}