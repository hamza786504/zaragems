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
            alt="Master goldsmith setting a rare sapphire into a bespoke Zaragems ring"
            src="/baracelts.jpg"   // Replace with a jewellery‑focused image if available
            width={600}
            height={600}
          />
        </div>
        <div>
          <h2 className="text-label-md font-label-md text-secondary tracking-[0.3em] uppercase mb-6">
            Our Heritage
          </h2>
          <h3 className="text-2xl md:text-3xl text-display-lg-mobile md:text-headline-md font-display-lg leading-tight mb-8">
            Where Rare Gemstones Meet Masterful Design
          </h3>
          <p className="text-body-lg font-body-lg text-on-surface-variant mb-10 leading-relaxed">
            Zaragems was born from a passion for the world’s most exceptional
            gemstones and the ancient art of fine jewellery making. Every piece we
            create is a dialogue between nature’s rarest treasures and the hands of
            master artisans — a fusion of heirloom-quality craftsmanship with a
            modern, sculptural aesthetic. From responsibly sourced sapphires to
            the fire of Mozambican rubies, we transform raw beauty into enduring
            symbols of elegance.
          </p>
          <Link
            className="inline-block border-b border-primary pb-1 text-label-md font-label-md hover:text-secondary hover:border-secondary transition-all"
            href="/about"
          >
            DISCOVER OUR COLLECTIONS
          </Link>
        </div>
      </div>
    </section>
  );
}