// components/ProductCard.jsx
'use client';

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useCart } from "../store/cartContext"

export default function ProductCard({
    id,
    title,
    price,
    priceNumeric,
    image,
    type,
    sizes = [],
    colors = [],
    isAccessory = false,
    slug = "",
}) {
    const { addToCart } = useCart();
    const [justAdded, setJustAdded] = useState(false);

    // Product images are always full URLs (Sanity CDN), so just pass them through
    // next/image's loader unchanged.
    const passthroughLoader = ({ src }) => src;

    const handleQuickAdd = () => {
        const numericPrice = typeof priceNumeric === 'number'
            ? priceNumeric
            : typeof price === 'number'
                ? price
                : Number(String(price).replace(/[^0-9.]/g, ''));

        addToCart(slug, sizes?.[0], colors?.[0], 1, {
            _id: id,
            title,
            price: numericPrice,
            sizes,
            colors,
            images: [image],
            productType: type,
            isAccessory,
        });

        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
    };

    return (
        <div className="overflow-hidden product-card group cursor-pointer block">
            <div
                className="relative overflow-hidden bg-surface-container-low"
                style={{ aspectRatio: '3/4' }}
            >
                <Link href={`/product/${slug}`} className="absolute inset-0 block">
                    <Image
                        loader={passthroughLoader}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={image}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        unoptimized={image.startsWith('http')}
                    />
                </Link>
                <button
                    type="button"
                    onClick={handleQuickAdd}
                    className="absolute bottom-0 left-0 z-10 w-full bg-primary text-white py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 font-label-md tracking-widest text-center text-sm border-none cursor-pointer"
                >
                    {justAdded ? 'ADDED ✓' : 'QUICK ADD'}
                </button>
            </div>
            <div className="mt-4 flex flex-col gap-1">
                {type && (
                    <p className="text-label-sm font-label-sm text-on-surface-variant/70 uppercase tracking-widest">
                        {type}
                    </p>
                )}
                <Link
                    href={`/product/${slug}`}
                    className="text-body-lg font-body-lg text-primary font-medium group-hover:text-secondary transition-colors line-clamp-2"
                >
                    {title}
                </Link>
                <p className="text-headline-sm font-headline-sm text-secondary font-semibold mt-1">
                    {price}
                </p>
                {sizes && sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {sizes.map((size) => (
                            <span
                                key={size}
                                className="text-[10px] font-label-sm font-bold text-on-surface-variant/80 border border-secondary/20 px-2 py-0.5 rounded-sm hover:border-secondary hover:text-secondary transition-colors"
                            >
                                {size}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
