'use client';
// components/Footer.jsx
import Link from 'next/link';
import { useState } from 'react';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import Image from 'next/image';

export default function Footer() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');

    const handleWhatsAppSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        const encodedMessage = encodeURIComponent(message.trim());
        window.open(`https://wa.me/923226612073?text=${encodedMessage}`, '_blank');
        setMessage('');
        setIsOpen(false);
    };

    return (
        <>
            <footer className="bg-white border-t border-secondary/30 pt-stack-lg pb-10">
           <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row flex-wrap gap-gutter mb-20">
    {/* First Column - 35% width on desktop */}
    <div className="w-full md:w-[35%] lg:w-[35%]">
        <Link
            href="/"
            className="text-headline-sm font-headline-sm text-primary mb-6 block uppercase tracking-widest"
        >
            <Image src="/logo.png" width="150" height="100" alt="logo" />
        </Link>
        <p className="text-body-lg font-body-md text-on-surface-variant leading-relaxed">
            Dedicated to the art of luxury Eastern wear, blending centuries-old traditions
            with modern silhouettes.
        </p>
    </div>

    {/* Remaining columns take up remaining space */}
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {/* Collections Column */}
        <div>
            <h4 className="font-bold text-base text-primary mb-8 tracking-widest">
                COLLECTIONS
            </h4>
            <ul className="space-y-4">
                <li>
                    <Link
                        href="/collection/new-arrival"
                        className="text-on-surface-variant font-label-sm hover:text-secondary transition-all"
                    >
                        New Arrival
                    </Link>
                </li>
                <li>
                    <Link
                        href="/collection/chiffon"
                        className="text-on-surface-variant font-label-sm hover:text-secondary transition-all"
                    >
                        Chiffon
                    </Link>
                </li>
                <li>
                    <Link
                        href="/collection/3pc"
                        className="text-on-surface-variant font-label-sm hover:text-secondary transition-all"
                    >
                        3 PC
                    </Link>
                </li>
                <li>
                    <Link
                        href="/collection/lawn"
                        className="text-on-surface-variant font-label-sm hover:text-secondary transition-all"
                    >
                        Lawn
                    </Link>
                </li>
            </ul>
        </div>

        {/* Assistance Column */}
        <div>
            <h4 className="font-bold text-base text-primary mb-8 tracking-widest">
                ASSISTANCE
            </h4>
            <ul className="space-y-4">
                <li>
                    <Link
                        href="#"
                        className="text-on-surface-variant font-label-sm hover:text-secondary transition-all"
                    >
                        Our Story
                    </Link>
                </li>
                <li>
                    <Link
                        href="#"
                        className="text-on-surface-variant font-label-sm hover:text-secondary transition-all"
                    >
                        Shipping Policy
                    </Link>
                </li>
                <li>
                    <Link
                        href="#"
                        className="text-on-surface-variant font-label-sm hover:text-secondary transition-all"
                    >
                        Returns
                    </Link>
                </li>
                <li>
                    <Link
                        href="#"
                        className="text-on-surface-variant font-label-sm hover:text-secondary transition-all"
                    >
                        Size Guide
                    </Link>
                </li>
                <li>
                    <Link
                        href="#"
                        className="text-on-surface-variant font-label-sm hover:text-secondary transition-all"
                    >
                        Contact Us
                    </Link>
                </li>
            </ul>
        </div>

        {/* Connect Column */}
        <div>
            <h4 className="font-bold text-base  text-primary mb-8 tracking-widest">
                CONNECT
            </h4>
            <div className="flex space-x-6">
                <Link
                    href="#"
                    className="text-secondary hover:text-primary transition-all duration-300 active:scale-95"
                    aria-label="Facebook"
                >
                    <FaFacebook size={24} />
                </Link>
                <Link
                    href="#"
                    className="text-secondary hover:text-primary transition-all duration-300 active:scale-95"
                    aria-label="Instagram"
                >
                    <FaInstagram size={24} />
                </Link>
                <Link
                    href="#"
                    className="text-secondary hover:text-primary transition-all duration-300 active:scale-95"
                    aria-label="TikTok"
                >
                    <FaTiktok size={24} />
                </Link>
            </div>
            <div className="mt-8">
                <p className="text-label-sm font-label-sm text-on-surface-variant">
                    Pakistan | Global Shipping
                </p>
            </div>
        </div>
    </div>
</div>
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center md:text-left">
                <p className="text-label-sm font-label-sm text-on-tertiary-container">
                    &copy; 2024 Zaragems. Crafting Heritage with Contemporary Luxury.
                </p>
            </div>
        </footer>

        {/* WhatsApp Chat Widget */}
        <div className="relative">
            {/* Chat Window Popup */}
            <div 
                className={`fixed bottom-24 right-6 md:right-8 z-[95] w-[320px] sm:w-[360px] bg-white rounded-2xl shadow-2xl border border-secondary/15 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
                    isOpen 
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                        : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
                }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-[#075E54] p-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary/10 border border-secondary/30 text-secondary rounded-full flex items-center justify-center font-bold text-sm relative">
                            ZG
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full border-2 border-primary" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Zaragems</h4>
                            <p className="text-[10px] text-white/70">Typically replies in minutes</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer bg-transparent border-none outline-none"
                        aria-label="Close chat"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-grow p-4 bg-[#F4F1EB] min-h-[160px] flex flex-col justify-end">
                    <div className="bg-white text-primary p-3 rounded-2xl rounded-tl-none shadow-sm text-[13px] leading-relaxed max-w-[85%] border border-secondary/5 self-start mb-2">
                        <p>Assalam-o-Alaikum! Welcome to Zaragems. How can we assist you with our luxury collections today?</p>
                        <span className="text-[9px] text-on-surface-variant/50 block text-right mt-1">
                            Today
                        </span>
                    </div>
                </div>

                {/* Input Form */}
                <form onSubmit={handleWhatsAppSubmit} className="p-3 bg-surface-container-low border-t border-secondary/10 flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-grow bg-white border border-outline-variant/30 rounded-full px-4 py-2 text-xs focus:border-secondary focus:ring-0 focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="w-8 h-8 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all cursor-pointer border-none outline-none"
                        aria-label="Send message"
                    >
                        <span className="material-symbols-outlined text-[16px] text-white font-bold">send</span>
                    </button>
                </form>
            </div>

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 md:right-8 z-[95] w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border-none outline-none group"
                aria-label="Contact support on WhatsApp"
            >
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping group-hover:hidden" />
                )}
                
                {isOpen ? (
                    <span className="material-symbols-outlined text-[28px] text-white">close</span>
                ) : (
                    <FaWhatsapp className='text-[32px]' />
                )}
            </button>
        </div>
    </>
);
}