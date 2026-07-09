'use client';

import { useEffect } from 'react';
import HeroCarousel from '../_components/HeroCarousel';
import NewArrivals from '../_components/NewArrivals';
import CategoryShowcase from '../_components/CategoryShowcase';
import HandcraftedCategories from '../_components/HandcraftedCategories';
import BrandStory from '../_components/BrandStory';
import FeaturedProducts from '../_components/FeaturedProducts';
import HandcraftedAccessories from '../_components/HandcraftedAccessories';
import Newsletter from '../_components/Newsletter';
import Testimonials from '../_components/Testimonials';

export default function Home() {
    useEffect(() => {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-10');
                }
            });
        }, observerOptions);

        document.querySelectorAll('section').forEach((section) => {
            section.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-10');
            observer.observe(section);
        });

        // Smooth header hide/show on scroll
        let lastScroll = 0;
        const handleScroll = () => {
            const currentScroll = window.pageYOffset;
            const header = document.querySelector('header');
            if (header) {
                if (currentScroll > lastScroll && currentScroll > 100) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            }
            lastScroll = currentScroll;
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    return (
        <main>
            <HeroCarousel />
            <NewArrivals />
            <CategoryShowcase />
            <HandcraftedCategories />
            <FeaturedProducts />
            <HandcraftedAccessories />
            <Testimonials />
            <BrandStory />
            <Newsletter />
        </main>
    );
}