'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const subjects = [
    'Order Inquiry',
    'Product Details',
    'Bespoke Appointments',
    'Press & Media',
    'Other',
];

const boutiques = [
    {
        city: 'Lahore Flagship',
        address: 'Plot 42-C, Gulberg III,\nMain Boulevard, Lahore',
        phone: '+92 42 111 000 222',
        hours: '11:00 AM – 09:30 PM',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzm1_aRMBNQQjYzFrjUbquhJGaruDS0N0Zezr459hn8y0q3aG8jmqjv0AbisSz603t_0MkPsCJwIDZ_MV6ye2NpBSFsKtNIoATmSpzyYkqZkfotuRQfftbCfh6FsIRcXZCgUXVgWBP95sjyi85XPwnkKNEnSXxc9FvHNXGTvWjgPA5xC-D3zPLOCZLjGZIzyxgkM_fAtUt5-ix7rA37s6wruMX1uO5Le_FeGzpSkqw1pj4laM2RWhZIsSKfY8BdaqKz_OHgOGbiuQs',
    },
    {
        city: 'Karachi Studio',
        address: 'E-Street, Block 4,\nClifton, Karachi',
        phone: '+92 21 3555 1234',
        hours: '10:30 AM – 09:00 PM',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhwncIKcSu59ILiqIKftqWPKZ0nJfeVNXnLntfaIMHQJOhouloOZSFDBIazaljhKlZVELGY_BxshSjMupxWyI3XhPm2Z_Wotu-rj6yWmUp_DePZ9Ueqo2TRlfnIRRMLzlMkgaMLx_1wxIg74EWmtJ0yl37noPAIJuN0JH3Gug4JJDkUY6Aeu2RM764ikltpY6br-SR9pBp6zHztosx06HIuQ5A3ysoytJaEbMbTinBq1qDbUMNUkrXznV8Z9vlxbrdPvlVBCp-9gZm',
    },
    {
        city: 'Islamabad Boutique',
        address: 'The Centaurus Mall,\nF-8, Islamabad',
        phone: '+92 51 844 5678',
        hours: '11:00 AM – 10:00 PM',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtHRphJbfIJ7cLDSyI62r-bbz83HKikd2A60IJLxHDp9FxLX4gNA7KExE0cSxR0j_eEHSNnghzF1z8SHjGNyJXaTNFa07zdMAAw_vZH24h5Fb7aTJ4HTY7cCZEE2Ry5z06cgaWtcuV0GRIw851_IDAf8db9dC_9Fut5bbsCzAnOpQYqIbOolMXeR0CIXU5u2EMMvPQjEGsa-twiolurppqlqqN7qC5K-MJ1cE_o1BynfbB7-LPb6ITwmHBVfWMtVuHPnYOso5zEgCH',
    },
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Order Inquiry',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setIsSubmitting(false);
            setSubmitStatus('success');

            // Reset form after success
            setTimeout(() => {
                setSubmitStatus(null);
                setFormData({ name: '', email: '', subject: 'Order Inquiry', message: '' });
            }, 3000);
        } catch (error) {
            setIsSubmitting(false);
            setSubmitStatus('error');

            setTimeout(() => {
                setSubmitStatus(null);
            }, 3000);
        }
    };

    // Scroll reveal animation
    useEffect(() => {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-8');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-reveal').forEach((section) => {
            section.classList.add('transition-all', 'duration-1000', 'ease-out', 'opacity-0', 'translate-y-8');
            observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="bg-surface text-on-surface font-body-md overflow-x-hidden">
            {/* Global Styles */}
            <style jsx global>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
                }
                .hero-gradient {
                    background: linear-gradient(180deg, rgba(252,249,248,0) 0%, rgba(252,249,248,1) 100%);
                }
                .transition-soft {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>

            <main>
                {/* Hero Section */}
                <section className="relative max-h-[614px] h-full flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <Image
                            className="object-cover"
                            alt="Luxury boutique interior"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfIKML1OXLUbGAoT3U5zg0Z2JDj4quhg7kkAXcTd9n4F1X_zFhKgcMn1dZhW6didVodIIOHeCTpww7l3SYgaOiuaTiq2sfxjolVidc2IalqujahETGX6nFrP1-xssgtfmSS2DbBXdJ1kJR59hRyqu024QRoUMPXxv4zeSCNBX_VbeO6BHfQgafFSwcr-oRZO12ThyrkTx8pqvB3Ri66y_YzzrB6cM30ujmTOTz9jL144ppr7Cq8aau3WFZrtYcafjYfq8ZkLldA3bK"
                            fill
                            sizes="100vw"
                            priority
                        />
                        <div className="absolute inset-0 bg-primary/20" />
                        <div className="absolute inset-0 hero-gradient" />
                    </div>
                    <div className="relative z-10 text-center px-margin-mobile">
                        <span className="font-label-md text-label-md text-secondary uppercase tracking-[0.2em] mb-4 block">
                            Connect with Us
                        </span>
                        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6">
                            Concierge &amp; Inquiries
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                            Experience the personal touch of Zaragems craftsmanship. Whether you seek
                            style advice or order assistance, our team is at your service.
                        </p>
                    </div>
                </section>

                {/* Contact & Customer Care Grid */}
                <section className="px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter scroll-reveal">
                        {/* Left Column: Form */}
                        <div className="lg:col-span-7 bg-white p-6 md:p-16 border border-secondary/10">
                            <h2 className="font-headline-md text-headline-md text-primary mb-10">
                                Send a Message
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="relative group">
                                        <label
                                            className="font-label-md text-label-md text-secondary mb-2 block"
                                            htmlFor="name"
                                        >
                                            Your Name
                                        </label>
                                        <input
                                            className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 font-body-md transition-soft placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-secondary"
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="E.g. Elena Varma"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="relative group">
                                        <label
                                            className="font-label-md text-label-md text-secondary mb-2 block"
                                            htmlFor="email"
                                        >
                                            Email Address
                                        </label>
                                        <input
                                            className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 font-body-md transition-soft placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-secondary"
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="elena@example.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="relative group">
                                    <label
                                        className="font-label-md text-label-md text-secondary mb-2 block"
                                        htmlFor="subject"
                                    >
                                        Subject
                                    </label>
                                    <select
                                        className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 font-body-md transition-soft text-on-surface-variant/70 focus:outline-none focus:border-b-secondary"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                    >
                                        {subjects.map((subject) => (
                                            <option key={subject} value={subject}>
                                                {subject}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative group">
                                    <label
                                        className="font-label-md text-label-md text-secondary mb-2 block"
                                        htmlFor="message"
                                    >
                                        Message
                                    </label>
                                    <textarea
                                        className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 font-body-md transition-soft placeholder:text-on-surface-variant/40 resize-none focus:outline-none focus:border-b-secondary"
                                        id="message"
                                        name="message"
                                        placeholder="How may we assist you today?"
                                        rows="4"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="pt-6">
                                    <button
                                        className="group relative overflow-hidden bg-primary text-white px-10 py-4 font-label-md text-label-md uppercase tracking-widest transition-soft hover:scale-[1.02] border border-secondary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        <span className="relative z-10">
                                            {isSubmitting
                                                ? 'Sending...'
                                                : submitStatus === 'success'
                                                ? 'Message Sent'
                                                : 'Submit Inquiry'}
                                        </span>
                                        <div className="absolute inset-0 bg-secondary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right Column: Details & Map */}
                        <div className="lg:col-span-5 space-y-gutter">
                            {/* Customer Care Card */}
                            <div className="bg-secondary-container/10 p-6 md:p-10 border border-secondary/10">
                                <h3 className="font-headline-sm text-headline-sm text-primary mb-6">
                                    Customer Care
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <span className="material-symbols-outlined text-secondary">
                                            phone_iphone
                                        </span>
                                        <div>
                                            <p className="font-label-md text-label-md text-primary">
                                                Inquiry Hotline
                                            </p>
                                            <p className="font-body-md text-on-surface-variant">
                                                +92 21 3456 7890
                                            </p>
                                            <p className="text-label-sm text-on-surface-variant/60">
                                                Mon - Sat, 10am - 8pm PKT
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <span className="material-symbols-outlined text-secondary">mail</span>
                                        <div>
                                            <p className="font-label-md text-label-md text-primary">
                                                Direct Email
                                            </p>
                                            <p className="font-body-md text-on-surface-variant">
                                                concierge@zaragems.com
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <span className="material-symbols-outlined text-secondary">
                                            chat_bubble
                                        </span>
                                        <div>
                                            <p className="font-label-md text-label-md text-primary">
                                                Live Assistance
                                            </p>
                                            <p className="font-body-md text-on-surface-variant">
                                                Available via WhatsApp
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Representation of Location */}
                            <div className="relative h-64 md:h-80 w-full overflow-hidden border border-secondary/10 group">
                                <div className="absolute inset-0 bg-surface-variant">
                                    <Image
                                        className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-soft"
                                        alt="Map of Karachi, Pakistan, home of our global headquarters"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxibklL4eAD0Lp2LItXM1VaGOLOekOPOO2vTg69Dimk9UlW-fjgRlvShlBKNJT8DPy76rbh8YLVdVNLz8YI8ljoYmgnDwE2Ro-OkM4Vvnu67jp3Dgk-jwDyiAwjUXsLGCyApJuAR2yde6fQ4l4DRkN5fZZEJndD80vMrjELp_gn5_MaVjfmgVLGL42hb9yka7Pq7aGEs2aELfeGZhzOEZ0WBpj3AGlPqqs1QRG82GoO33CYdE7IS2h0F7RRghFfdz-boQcu63iDsp7"
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                                <div className="absolute bottom-6 left-6 text-white">
                                    <p className="font-headline-sm text-headline-sm">Global Headquarters</p>
                                    <p className="font-label-md text-label-md opacity-80">Karachi, PK</p>
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center animate-pulse">
                                        <div className="w-4 h-4 bg-secondary rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Ateliers Section */}
                <section className="bg-surface-container-low py-stack-lg">
                    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                        <div className="text-center mb-16 scroll-reveal">
                            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
                                Our Ateliers
                            </h2>
                            <div className="h-px w-24 bg-secondary mx-auto" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                            {boutiques.map((boutique, index) => (
                                <div
                                    key={boutique.city}
                                    className="group bg-white p-6 md:p-8 border border-secondary/5 hover:border-secondary/30 transition-soft scroll-reveal"
                                    style={{ transitionDelay: `${index * 100}ms` }}
                                >
                                    <div className="relative h-48 mb-8 overflow-hidden">
                                        <Image
                                            className="object-cover group-hover:scale-110 transition-soft"
                                            alt={`${boutique.city} boutique storefront`}
                                            src={boutique.image}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    </div>
                                    <h4 className="font-headline-sm text-headline-sm text-primary mb-4">
                                        {boutique.city}
                                    </h4>
                                    <div className="space-y-4 text-on-surface-variant font-body-md">
                                        {boutique.address.split('\n').map((line, i) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                        <p>{boutique.phone}</p>
                                        <div className="pt-4 border-t border-outline-variant/30">
                                            <p className="text-label-sm uppercase tracking-wider text-secondary">
                                                Hours
                                            </p>
                                            <p>{boutique.hours}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter / Contact CTA */}
                <section className="py-stack-lg px-margin-mobile text-center scroll-reveal">
                    <div className="max-w-3xl mx-auto">
                        <span
                            className="material-symbols-outlined text-secondary text-5xl mb-6"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            star
                        </span>
                        <h3 className="font-display-lg text-headline-md md:text-display-lg text-primary mb-4">
                            Bespoke Consultations
                        </h3>
                        <p className="font-body-lg text-body-lg text-on-surface-variant mb-10">
                            Looking for a custom ensemble for your special day? Schedule a private appointment 
                            with our lead designers at any of our flagship ateliers.
                        </p>
                        <Link
                            className="inline-block border border-primary text-primary px-12 py-5 font-label-md text-label-md uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-soft"
                            href="#"
                        >
                            Contact Us
                        </Link>
                    </div>
                </section>
            </main>

        </div>
    );
}