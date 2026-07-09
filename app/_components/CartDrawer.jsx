'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function CartDrawer({ isOpen, onClose, cartItems = [], onUpdateQuantity, onRemoveItem }) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.classList.add('cart-drawer-open');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(true);
                });
            });
        } else {
            setIsAnimating(false);
            document.body.classList.remove('cart-drawer-open');
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleOverlayClick = useCallback(() => {
        onClose();
    }, [onClose]);

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const formatPrice = (price) => {
        return `PKR ${price.toLocaleString()}`;
    };

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        if (onUpdateQuantity) {
            onUpdateQuantity(itemId, newQuantity);
        }
    };

    const handleRemoveItem = (itemId) => {
        if (onRemoveItem) {
            onRemoveItem(itemId);
        }
    };

    // Handle navigation click - close drawer before navigating
    const handleNavigationClick = useCallback((href) => {
        onClose(); // Close the drawer
        
        // Navigate after a short delay to allow close animation to start
        setTimeout(() => {
            router.push(href);
        }, 150);
    }, [onClose, router]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Overlay */}
            <div
                className={`absolute inset-0 transition-all duration-500 ${
                    isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                    backgroundColor: 'rgba(0, 37, 30, 0.2)',
                    backdropFilter: 'blur(8px)',
                }}
                onClick={handleOverlayClick}
            />

            {/* Drawer Panel - Reduced width */}
            <div
                className={`absolute right-0 top-0 h-full w-full sm:w-[400px] bg-surface flex flex-col shadow-2xl border-l border-secondary/20 transition-transform duration-500 ease-in-out ${
                    isAnimating ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Compact Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/10">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl text-secondary">shopping_bag</span>
                        <h2 className="text-[18px] font-headline-sm uppercase tracking-wide">
                            Bag ({cartItems.length})
                        </h2>
                    </div>
                    <button
                        className="p-1.5 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center"
                        onClick={onClose}
                        aria-label="Close cart"
                    >
                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
                    </button>
                </div>

                {/* Cart Items List - Compact spacing */}
                <div className="flex-grow overflow-y-auto px-5 py-3 space-y-4 scrollbar-hide">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-on-surface-variant py-12">
                            <span className="material-symbols-outlined text-5xl mb-3">shopping_bag</span>
                            <p className="text-sm">Your bag is empty</p>
                            <button
                                className="mt-3 text-xs text-secondary underline underline-offset-4 hover:text-primary transition-colors"
                                onClick={onClose}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Free shipping progress bar */}
                            <div className="bg-surface-container-low rounded-lg p-3 text-center">
                                <p className="text-[11px] text-on-surface-variant mb-1.5">
                                    Free shipping on orders above PKR 10,000
                                </p>
                                <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-secondary transition-all duration-500"
                                        style={{ width: `${Math.min((calculateSubtotal() / 10000) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-3 group">
                                    {/* Smaller image */}
                                    <div className="w-20 h-24 flex-shrink-0 overflow-hidden bg-surface-container rounded-sm">
                                        <Image
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            src={item.image}
                                            width={80}
                                            height={96}
                                        />
                                    </div>
                                    <div className="flex flex-col justify-between flex-grow min-w-0">
                                        <div>
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="text-sm font-medium leading-snug line-clamp-2 text-primary">
                                                    {item.title}
                                                </h3>
                                                <button
                                                    className="text-on-surface-variant/50 hover:text-error transition-colors flex-shrink-0"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    aria-label={`Remove ${item.title}`}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
                                                {item.size}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-end mt-1">
                                            <div className="flex items-center border border-secondary/20 rounded-sm">
                                                <button
                                                    className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">remove</span>
                                                </button>
                                                <span className="text-xs font-medium w-7 text-center">{item.quantity}</span>
                                                <button
                                                    className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-container transition-colors"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                                </button>
                                            </div>
                                            <p className="text-sm font-headline-sm text-primary">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Note */}
                            <p className="text-[11px] italic text-on-surface-variant/60 py-2 border-t border-secondary/5">
                                Shipping & taxes calculated at checkout
                            </p>
                        </>
                    )}
                </div>

                {/* Compact Footer */}
                {cartItems.length > 0 && (
                    <div className="px-5 py-4 bg-surface-container-low border-t border-secondary/20 space-y-3">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs uppercase tracking-widest text-on-surface-variant">
                                Subtotal
                            </span>
                            <span className="text-lg font-headline-sm font-bold text-primary">
                                {formatPrice(calculateSubtotal())}
                            </span>
                        </div>
                        
                        {/* Checkout Button - Close drawer then navigate */}
                        <button 
                            onClick={() => handleNavigationClick('/checkout')}
                            className="w-full bg-primary text-white py-3 text-sm font-label-md tracking-widest border border-secondary hover:bg-primary-container transition-all flex items-center justify-center gap-2 group"
                        >
                            CHECKOUT
                            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                                arrow_forward
                            </span>
                        </button>
                        
                        {/* View Cart Button - Close drawer then navigate */}
                        <button
                            onClick={() => handleNavigationClick('/cart')}
                            className="block w-full text-center text-xs text-secondary hover:text-primary underline underline-offset-4 decoration-secondary/30 transition-all"
                        >
                            View Cart
                        </button>

                        <div className="flex items-center justify-center gap-1.5 text-on-surface-variant/40 pt-1">
                            <span className="material-symbols-outlined text-[14px]">verified_user</span>
                            <span className="text-[10px] font-light">
                                Secure Checkout
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}