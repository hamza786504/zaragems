"use client";
import Image from "next/image";
import Link from "next/link";
// components/BrandStory.jsx
export default function BrandStory() {
    return (
        <section className="bg-surface-container py-stack-lg overflow-hidden">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid md:grid-cols-2 items-center gap-20">
                <div className="relative">
                    <div className="border border-secondary/30 absolute -inset-4 z-0 translate-x-8 translate-y-8" />
                    <Image
                        className="relative z-10 w-full h-[600px] object-cover"
                        alt="Artisan's hands working on intricate gold Zardozi embroidery"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHBDpHnjKZxc8raif-WM8SKUHRg6WeR3kTf9sn9clIk79NP38uh6rBp4haWvoVyjgA2fQxxYijSKUjlRLToSd_SqLCTHbydNbb8oZF3KNB-lHwh8W1lMp3ujnva5HTynbA1zSsyHA63j5m1JNsDwUEGBAa7kbyhOPtQRMA_jGJ0G6Zu0eIUIEdg5A_j-RoB9c92EAlIJ0PbG0Iew2vft8ZtLK5pn7fH-mw2RRyR2INd-UEM4WgaWgywcDpKUzMY1LxrdRsykHngxrL"
                        width={600}
                        height={600}
                    />
                </div>
                <div>
                    <h2 className="text-label-md font-label-md text-secondary tracking-[0.3em] uppercase mb-6">
                        Our Legacy
                    </h2>
                    <h3 className="text-display-lg-mobile md:text-headline-md font-display-lg leading-tight mb-8">
                        Crafting Heritage with Contemporary Luxury
                    </h3>
                    <p className="text-body-lg font-body-lg text-on-surface-variant mb-10 leading-relaxed">
                        At Zaragems, we believe that every thread tells a story of an ancient craft
                        reimagined for the modern woman. Our journey began with a vision to preserve the
                        intricate artistry of Eastern textiles while embracing a minimalist editorial
                        aesthetic. Each piece is a masterpiece of design, balancing opulent heritage with a
                        sense of &quot;quiet luxury.&quot;
                    </p>
                    <Link
                        className="inline-block border-b border-primary pb-1 text-label-md font-label-md hover:text-secondary hover:border-secondary transition-all"
                        href="#"
                    >
                        LEARN MORE ABOUT OUR CRAFT
                    </Link>
                </div>
            </div>
        </section>
    );
}