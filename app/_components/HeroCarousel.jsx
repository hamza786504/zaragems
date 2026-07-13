// components/HeroCarousel.jsx
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const slides = [
    {
        id: 0,
        image: '/banner.png',
    },
];

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const isCarousel = slides.length > 1;
    const goToSlide = (index) => setCurrentSlide(index);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

    return (
        <div
            id="controls-carousel"
            style={{ position: 'relative', width: '100%' }}
            data-carousel="static"
        >
            {/* Carousel wrapper — explicit height via inline style to guarantee it renders */}
            <div
                style={{
                    position: 'relative',
                    width: '100vw',
                    height: 'clamp(260px, 55vw, 600px)',
                    overflow: 'hidden',
                }}
            >
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: index === currentSlide ? 1 : 0,
                            transition: 'opacity 0.8s ease-in-out',
                            zIndex: index === currentSlide ? 1 : 0,
                        }}
                        aria-hidden={index !== currentSlide}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title || "Hero Banner"}
                            fill
                            priority
                            sizes="100vw"
                            style={{
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />

                        {/* Gradient overlay */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background:
                                    'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                            }}
                        />

                        {/* Text content */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                maxWidth: '900px',
                                margin: '0 auto',
                                padding: '0 2rem',
                            }}
                        >
                            <span
                                style={{
                                    color: 'rgba(255,255,255,0.85)',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    marginBottom: '0.75rem',
                                    display: 'block',
                                }}
                            >
                                {slide.tag}
                            </span>
                            <h2
                                style={{
                                    color: '#ffffff',
                                    fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
                                    fontWeight: 700,
                                    lineHeight: 1.15,
                                    marginBottom: '1rem',
                                    fontFamily: 'var(--font-eb-garamond), serif',
                                }}
                            >
                                {slide.title}
                            </h2>
                            <p
                                style={{
                                    color: 'rgba(255,255,255,0.88)',
                                    fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
                                    maxWidth: '32rem',
                                    lineHeight: 1.6,
                                }}
                            >
                                {slide.description}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Slide indicators — only shown when multiple slides exist */}
                {isCarousel && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '1.25rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '0.625rem',
                            zIndex: 10,
                        }}
                    >
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                aria-current={index === currentSlide ? 'true' : 'false'}
                                aria-label={`Slide ${index + 1}`}
                                onClick={() => goToSlide(index)}
                                style={{
                                    width: index === currentSlide ? '1.75rem' : '0.625rem',
                                    height: '0.625rem',
                                    borderRadius: '9999px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background:
                                        index === currentSlide
                                            ? '#ffffff'
                                            : 'rgba(255,255,255,0.5)',
                                    transition: 'all 0.3s ease',
                                    padding: 0,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Previous button — only shown when multiple slides exist */}
            {isCarousel && (
                <button
                    type="button"
                    aria-label="Previous slide"
                    onClick={prevSlide}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 10,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '9999px',
                            background: 'rgba(255,255,255,0.25)',
                            backdropFilter: 'blur(4px)',
                            transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.45)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                    >
                        <svg
                            style={{ width: '1.25rem', height: '1.25rem', color: '#fff' }}
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="m15 19-7-7 7-7"
                            />
                        </svg>
                    </span>
                </button>
            )}

            {/* Next button — only shown when multiple slides exist */}
            {isCarousel && (
                <button
                    type="button"
                    aria-label="Next slide"
                    onClick={nextSlide}
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        zIndex: 10,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '9999px',
                            background: 'rgba(255,255,255,0.25)',
                            backdropFilter: 'blur(4px)',
                            transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.45)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                    >
                        <svg
                            style={{ width: '1.25rem', height: '1.25rem', color: '#fff' }}
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="m9 5 7 7-7 7"
                            />
                        </svg>
                    </span>
                </button>
            )}
        </div>
    );
}