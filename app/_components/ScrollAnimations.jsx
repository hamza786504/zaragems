'use client';

import { useEffect } from 'react';

// Tiny client-only island — renders nothing visible, just attaches DOM listeners.
// Extracted so that page.jsx can be a Server Component (enabling ISR pre-rendering
// and server-side data fetching) while still having scroll animations.
export default function ScrollAnimations() {
    useEffect(() => {
        // Scroll-in animation for <section> elements
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('opacity-100', 'translate-y-0');
                        entry.target.classList.remove('opacity-0', 'translate-y-10');
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('section').forEach((section) => {
            section.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-10');
            observer.observe(section);
        });

        // Header hide-on-scroll-down, show-on-scroll-up
        let lastScroll = 0;
        const handleScroll = () => {
            const currentScroll = window.pageYOffset;
            const header = document.querySelector('header');
            if (header) {
                header.style.transform =
                    currentScroll > lastScroll && currentScroll > 100
                        ? 'translateY(-100%)'
                        : 'translateY(0)';
            }
            lastScroll = currentScroll;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    return null;
}
