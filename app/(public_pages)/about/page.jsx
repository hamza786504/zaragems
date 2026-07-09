'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '../../_components/Navbar';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
    const [revealedElements, setRevealedElements] = useState(new Set());
    const revealRefs = useRef([]);
    const [navShadow, setNavShadow] = useState(false);

    // Scroll reveal animation
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setRevealedElements((prev) => new Set([...prev, entry.target.dataset.revealId]));
                }
            });
        }, observerOptions);

        const currentRefs = revealRefs.current;
        currentRefs.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => {
            currentRefs.forEach((el) => {
                if (el) observer.unobserve(el);
            });
        };
    }, []);

    // Scroll header effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setNavShadow(true);
            } else {
                setNavShadow(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isRevealed = (id) => revealedElements.has(id);

    const milestones = [
        {
            year: '1994',
            title: 'The Humble Loom',
            description: 'Founded as a boutique atelier in Lahore, focusing exclusively on hand-embroidered wedding trousseaus for a discerning clientele.',
        },
        {
            year: '2008',
            title: 'Pret-a-Porter Evolution',
            description: 'Launching our first ready-to-wear collection, merging luxury craftsmanship with the fast-paced life of the modern Pakistani woman.',
        },
        {
            year: '2024',
            title: 'Global Heritage',
            description: "Today, Zaragems stands as a beacon of luxury, shipping to over 20 countries and maintaining a legacy of 'Heritage in every thread'.",
        },
    ];

    const artisans = [
        {
            name: 'MASTER ASHRAF',
            role: 'Head of Tailoring, 22 Years',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmxahtebSjWKWjAcjSEW4mbLzGPUpl7OqZkAsUuKso5s-1QspQWiHYuVnpVrMMg4W1tKXKonConALrzpdzpNj9t8T3xhcR0-nvpb9Gh-aomyqtIVHZa1xZKUiRqoMrtfeLbUW3d3SY7UpZKvZkd4v0skuf2D62b2WiW28xuQ7VNS2AUwWfNSrwAiQWTx74D6MgkxeOWQ195NJrrukwXAPe7ymGQ8IVo1iBfRl3bmIme_ciTxFTzXyzjjakvuPIQBYWSAw6mSDXHyjH',
        },
        {
            name: 'SARAH KHAN',
            role: 'Creative Design Lead',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBea3GXCb2E0S_7Xu4UO8IsHuFLMGyGef4rcjULfCyQ9jMiavd3mNrJh9WYawlFwksnwqHyVHkxLtLf0MxgsCoNr7tQ0fQl2ymCb__q-B1euj5_XxeEvZutjJrupq55kYWmt8UlbOhoTvlC8Gs7UfTQk6RSgoeKojoZnOZXt26aEQ71XN73tZRU-mMYotv60OcS44AoFfT0N48RHF2Q_PatsiwsWB8uYABB-1Xf7mijYZyoZlH6XCYS0x2Sz5kM_vcZ0S1-K2qJD54X',
        },
        {
            name: 'BEE GUL',
            role: 'Master of Hand-Embroidery',
            image: 'https://lh3.googleusercontent.com/aida/AP1WRLvtnZr6nIx1_yM4HAGsIDVg-kdLkZfO8rxfH9i4FI_zjqvOJUhRCGxmbb_oE2zW3lSccmRk56CEw6RVj4SE6zFvAiCfL3ZlLQDieHCOCgyKyu14rGmxkhmBHVnc5r2cpgD42Ajg21pnZgJV99Tc54XlnTpUlR8wOyfrEb_6sUillmLld63WSHK-sYqxNmUO6ukr1IOFOjEULxVwrzZzV7UgkWTe1uVRPxzhAumQU8I0UgA9oN6drkSUYwJy',
        },
    ];

    const ateliers = [
        {
            city: 'Lahore',
            address: 'GULBERG III MAIN BOULEVARD',
            description: 'The original home of Zaragems, featuring our private bridal lounge and heritage archive.',
            linkText: 'Book an Appointment',
        },
        {
            city: 'Karachi',
            address: 'E-STREET, CLIFTON',
            description: 'A minimalist space designed to showcase our ready-to-wear luxury lawn and festive collections.',
            linkText: 'View Store Details',
        },
        {
            city: 'Islamabad',
            address: 'F-7 MARKAZ',
            description: 'Our flagship northern atelier, reflecting the serene elegance of the capital in its architecture.',
            linkText: 'Directions',
        },
    ];

    return (
        <div className="bg-surface text-on-surface font-body-md overflow-x-hidden">
            {/* Global Styles */}
            <style jsx global>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .reveal-animation {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.8s ease-out;
                }
                .reveal-animation.revealed {
                    opacity: 1;
                    transform: translateY(0);
                }
                .editorial-line {
                    height: 1px;
                    background: linear-gradient(to right, transparent, rgba(119, 90, 25, 0.3), transparent);
                }
            `}</style>

            <Navbar />

            {/* Hero Section */}
            <header className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        alt=""
                        className="object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx_eyR25uQlMCx1RPHcRrhUE61kr6upBUHv9c3xtAigBoZoWXqni8t5OHTfabIQDlQ_Wa-fCVY_Gj-qcpcPJh6pfqEPiD_WE1sa5iEAvRM40SiHHWSUY6AcrvqqwOlGnIBygcwx-BPs2TFIFNXNuKzAUpug15jsGMr6Pblk4WJRaod4tCHR1wbIp43DJAtYSRnD-o1y6yZV7sjPKlUkEUaK41a5o9MpkSXvmSxqfmv6Id3rV0usPn1Freq3h4PpoM4qela5-qp0GBn"
                        fill
                        sizes="100vw"
                        priority
                    />
                    {/* Gradient Overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-surface/80 via-surface/40 to-transparent" />
                </div>
                <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full">
                    <div className="max-w-2xl space-y-stack-sm">
                        <span className="font-label-md text-label-md text-secondary uppercase tracking-[0.2em] block">
                            Established 1994
                        </span>
                        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary leading-tight">
                            The Art of <br />
                            <span className="italic">Timeless Heritage</span>
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                            Zaragems is more than a fashion house; it is a custodian of century-old
                            Eastern traditions, woven into the modern silhouette of the sophisticated woman.
                        </p>
                    </div>
                </div>
            </header>

            {/* Our Heritage Section */}
            <section className="py-stack-lg bg-surface">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                    <div className="editorial-line mb-stack-md" />
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                        <div className="md:col-span-4 self-center">
                            <h2 className="font-headline-md text-headline-md text-primary mb-6">
                                Our Heritage
                            </h2>
                            <p className="text-on-surface-variant mb-8 leading-relaxed">
                                Our story begins in the heart of artisanal workshops, where the rhythm of the 
                                loom and the delicacy of the needle tell tales of generations. Every piece of 
                                fabric we source and every stitch we place is an homage to the masters of 
                                Eastern craftsmanship.
                            </p>
                            <div className="flex items-center gap-4 text-secondary font-label-md">
                                <span className="material-symbols-outlined">auto_awesome</span>
                                <span>PURE FABRICS &amp; HAND-WORK</span>
                            </div>
                        </div>
                        <div className="md:col-span-8 grid grid-cols-2 gap-gutter">
                            <div className="relative aspect-square bg-surface-container-low overflow-hidden mt-12">
                                <Image
                                    alt="Luxury Eastern suit detail"
                                    className="object-cover"
                                    src="https://lh3.googleusercontent.com/aida/AP1WRLvgDjwCVEdNUtgZy0gaw26nnP9z6-XUSdHHGRd4LKJzYMq-7iJNEMPa5rVTN-lVx1c0H6nn2Ms1TQQuAo35oMzQ77NINcSqNndldmHDz_ejlwrT9FBGC98RbxqKh2bDCGU8h1sqHHz6wuKvJCJiVoP5-RJ2IzwhdgJXNkNijxJ2zn5qiIdN7D2prnZYRE6h422Db_Fr-0Nc03wS0VU8X569HGEqUSIn3T8Bp3Vcb59DyZ_EsLu9vdr7OYfT"
                                    fill
                                    sizes="(max-width: 768px) 50vw, 33vw"
                                />
                            </div>
                            <div className="relative aspect-[3/4] bg-surface-container overflow-hidden">
                                <Image
                                    alt="Close-up of artisan craftsmanship"
                                    className="object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQElh5LImfqG-IjqxuarhZRFTWxpvmFSxOWs0112PlpUo6Aw6TDpqs1_ZlN33P1idsW3OcKpvkqX_vUsfTZ89RLQ0weJJlGIxhoaHizfxtVhMtaug3qZO1sC3DEYOpkaCiheXX0RdS661EZ57csWyxQGuL_ys_jPrtFO_rJrX0OJBsQq4hca8XpAEh0XfXJsk0WXLSVHzGhc4O3_HTXs6dxlScEEVZvY4U6OJGE45s0yHBx4uDNFDiC37--3xzWVxZaMkeKKZwE97W"
                                    fill
                                    sizes="(max-width: 768px) 50vw, 33vw"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Journey Section */}
            <section className="py-stack-lg bg-surface-container-lowest">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                    <div className="text-center mb-stack-md">
                        <h2 className="font-headline-md text-headline-md text-primary">The Journey</h2>
                        <div className="w-16 h-px bg-secondary mx-auto mt-4" />
                    </div>
                    <div className="space-y-stack-md max-w-4xl mx-auto">
                        {milestones.map((milestone, index) => (
                            <div
                                key={milestone.year}
                                ref={(el) => (revealRefs.current[index] = el)}
                                data-reveal-id={`milestone-${index}`}
                                className={`reveal-animation flex flex-col md:flex-row gap-gutter items-start ${
                                    isRevealed(`milestone-${index}`) ? 'revealed' : ''
                                } ${index === 2 ? 'border-l-2 border-secondary/20 pl-8 ml-4 md:ml-0 md:border-0 md:pl-0' : ''}`}
                            >
                                <div className="font-display-lg text-headline-md text-secondary-fixed-dim shrink-0">
                                    {milestone.year}
                                </div>
                                <div className="pt-2">
                                    <h3 className="font-headline-sm text-headline-sm mb-2">
                                        {milestone.title}
                                    </h3>
                                    <p className="text-on-surface-variant">
                                        {milestone.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Team / Artisans Section */}
            <section className="py-stack-lg bg-surface">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md items-end mb-stack-md">
                        <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary">
                            The Souls <br />
                            Behind the Silk
                        </h2>
                        <p className="text-body-lg text-on-surface-variant">
                            Our success is the collective breath of over 200 artisans, weavers, and designers 
                            who treat each garment as a canvas of history.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-gutter">
                        {artisans.map((artisan, index) => (
                            <div
                                key={artisan.name}
                                className={`group cursor-default ${index === 1 ? 'pt-stack-sm' : ''}`}
                            >
                                <div className="aspect-[3/4] bg-surface-variant overflow-hidden mb-4 relative">
                                    <Image
                                        alt={`Portrait of ${artisan.name}`}
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        src={artisan.image}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                    />
                                </div>
                                <h4 className="font-label-md text-label-md text-primary">
                                    {artisan.name}
                                </h4>
                                <p className="text-label-sm text-on-surface-variant">
                                    {artisan.role}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Flagship Locations Section */}
            <section className="py-stack-lg bg-primary text-on-primary">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                    <h2 className="font-headline-md text-headline-md mb-stack-md border-b border-on-primary/10 pb-4">
                        Flagship Ateliers
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
                        {ateliers.map((atelier) => (
                            <div key={atelier.city} className="space-y-4">
                                <h3 className="font-headline-sm text-on-primary-container">
                                    {atelier.city}
                                </h3>
                                <p className="text-on-primary/70 font-label-sm tracking-widest">
                                    {atelier.address}
                                </p>
                                <p className="text-body-md">{atelier.description}</p>
                                <Link
                                    className="inline-block mt-4 text-secondary-fixed hover:underline decoration-1"
                                    href="#"
                                >
                                    {atelier.linkText}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-tertiary text-on-tertiary">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto">
                    <div className="space-y-6">
                        <div className="font-headline-sm text-headline-sm text-secondary-fixed tracking-tight">
                            Zaragems
                        </div>
                        <p className="text-on-tertiary/70 max-w-xs">
                            Crafting heritage into every thread, bringing the soul of Eastern artistry to the world.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <ul className="space-y-3 font-body-md">
                            <li>
                                <Link className="hover:text-secondary-fixed-dim transition-colors" href="#">
                                    Brand Story
                                </Link>
                            </li>
                            <li>
                                <Link className="hover:text-secondary-fixed-dim transition-colors" href="#">
                                    Craftsmanship
                                </Link>
                            </li>
                            <li>
                                <Link className="hover:text-secondary-fixed-dim transition-colors" href="#">
                                    Customer Care
                                </Link>
                            </li>
                        </ul>
                        <ul className="space-y-3 font-body-md">
                            <li>
                                <Link className="hover:text-secondary-fixed-dim transition-colors" href="#">
                                    Shipping &amp; Returns
                                </Link>
                            </li>
                            <li>
                                <Link className="hover:text-secondary-fixed-dim transition-colors" href="#">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link className="hover:text-secondary-fixed-dim transition-colors" href="#">
                                    Store Locator
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h4 className="font-label-md tracking-widest">NEWSLETTER</h4>
                        <div className="flex border-b border-on-tertiary/20 pb-2">
                            <input
                                className="bg-transparent border-none focus:ring-0 text-on-tertiary placeholder:text-on-tertiary/40 w-full"
                                placeholder="Email Address"
                                type="email"
                            />
                            <button className="material-symbols-outlined text-secondary-fixed">east</button>
                        </div>
                        <div className="flex space-x-4 mt-6">
                            <Link
                                className="w-10 h-10 border border-on-tertiary/20 rounded-full flex items-center justify-center hover:bg-secondary-fixed-dim hover:text-primary transition-all"
                                href="#"
                            >
                                <span className="material-symbols-outlined text-[18px]">share</span>
                            </Link>
                            <Link
                                className="w-10 h-10 border border-on-tertiary/20 rounded-full flex items-center justify-center hover:bg-secondary-fixed-dim hover:text-primary transition-all"
                                href="#"
                            >
                                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 border-t border-on-tertiary/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-label-sm text-on-tertiary/50">
                    <span>© 2024 Zaragems. Heritage in every thread.</span>
                    <div className="flex gap-6">
                        <span>TERMS</span>
                        <span>PRIVACY</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}