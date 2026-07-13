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
      id="controls-carousel overflow-x-hidden"
      style={{ position: 'relative', width: '100%' }}
      data-carousel="static"
    >
      {/* Carousel wrapper – aspect-ratio handles height */}
      <div
        className="hero-banner"
        style={{
          position: 'relative',
          width: '98.8vw',
          overflowX: 'hidden',
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
            <Image
              src={slide.image}
              alt={slide.title || 'Hero Banner'}
              fill
              priority
              sizes="100vw"
              style={{
                objectFit: 'cover',
                display: 'block',
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

        {/* Slide indicators */}
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

      {/* Previous button */}
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
          {/* ... same SVG and hover effects ... */}
        </button>
      )}

      {/* Next button */}
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
          {/* ... same SVG and hover effects ... */}
        </button>
      )}

      {/* Responsive aspect ratios */}
      <style jsx>{`
        .hero-banner {
          /* Desktop: 7:3 */
          aspect-ratio: 7 / 3;
        }

        /* Mobile: change to a taller ratio, e.g. 4:3 */
        @media (max-width: 768px) {
          .hero-banner {
            aspect-ratio: 4 / 3;
          }
        }
      `}</style>
    </div>
  );
}