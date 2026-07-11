'use client'
// components/HandcraftedAccessories.jsx
import ProductCard from './ProductCard';
import productsData from '../data/products.json';
import Link from 'next/link';

const accessories = productsData.filter(p => p.isAccessory);

export default function HandcraftedAccessories() {
    return (
        <section className="py-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="flex justify-between items-end mb-16">
                <div>
                    <h2 className="text-headline-lg font-headline-lg font-bold">Handcrafted Accessories</h2>
                    <p className="text-label-md font-label-md text-on-surface-variant tracking-widest uppercase mt-2">
                        THE ART OF THE BAG
                    </p>
                </div>
                <Link
                    className="hidden md:block text-label-md font-label-md text-secondary hover:underline underline-offset-8"
                    href="/collection/accessories"
                >
                    VIEW COLLECTION
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 gap-y-4">
                {accessories.map((item) => (
                    <ProductCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        price={item.price}
                        priceNumeric={item.priceNumeric}
                        image={item.image || item.primaryImage}
                        slug={item.slug}
                        type={item.type}
                        sizes={item.sizes}
                        colors={item.colors}
                        isAccessory={item.isAccessory}
                    />
                ))}
            </div>

            <div className="mt-16 flex justify-center">
                <button className="border border-primary text-primary px-6 py-4 font-label-md uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300 text-sm group ">
                    SHOW MORE
                </button>
            </div>
        </section>
    );
}