// components/CategoryShowcase.jsx
'use client';

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import productsData from '../data/products.json';

const tabs = ['Lawn', 'Chiffon', '3pc', 'Accessories'];

export default function CategoryShowcase() {
    const [activeTab, setActiveTab] = useState('Lawn');

    const filteredProducts = useMemo(() => {
        if (activeTab === 'Lawn') {
            return productsData.filter(p => p.fabric === 'Lawn' && !p.isAccessory).slice(0, 4);
        }
        if (activeTab === 'Chiffon') {
            return productsData.filter(p => p.fabric === 'Chiffon' && !p.isAccessory).slice(0, 4);
        }
        if (activeTab === '3pc') {
            return productsData.filter(p => p.type && p.type.includes('3 Piece') && !p.isAccessory).slice(0, 4);
        }
        if (activeTab === 'Accessories') {
            return productsData.filter(p => p.isAccessory).slice(0, 4);
        }
        return productsData.slice(0, 4);
    }, [activeTab]);

    return (
        <section className="py-stack-lg bg-surface-bright">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                <div className="text-center mb-16">
                    <h2 className="text-display-lg-mobile md:text-headline-lg font-bold font-headline-md text-primary mb-4">
                        Our Collections
                    </h2>
                    <p className="text-label-md font-label-md text-secondary tracking-widest uppercase">
                        Timeless Elegance in Every Thread
                    </p>
                </div>

                {/* Collection Tabs */}
                <div className="flex flex-wrap justify-center gap-8 mb-12 border-b border-secondary/20 pb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`text-label-lg font-label-md cursor-pointer ${
                                activeTab === tab
                                    ? 'text-primary border-b-2 border-secondary pb-2 font-bold'
                                    : ' border-b-2 border-transparent text-on-surface-variant hover:text-secondary'
                            }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 gap-y-4">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            title={product.title}
                            price={product.price}
                            priceNumeric={product.priceNumeric}
                            image={product.image || product.primaryImage}
                            slug={product.slug}
                            type={product.type}
                            sizes={product.sizes}
                            colors={product.colors}
                            isAccessory={product.isAccessory}
                        />
                    ))}
                </div>

                <div className="mt-16 flex justify-center">
                    <button className="border border-primary text-primary px-6 py-4 font-label-md uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300 text-sm group ">
                        SEE MORE
                    </button>
                </div>
            </div>
        </section>
    );
}