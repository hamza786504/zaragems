"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../store/cartContext';
// Custom Hook for scroll header behavior
const useScrollHeader = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return isVisible;
};

// Quantity Selector Component
const QuantitySelector = ({ quantity, onQuantityChange }) => {
  const handleDecrease = useCallback(() => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  }, [quantity, onQuantityChange]);

  const handleIncrease = useCallback(() => {
    onQuantityChange(quantity + 1);
  }, [quantity, onQuantityChange]);

  return (
    <div className="flex items-center border border-outline-variant/30 bg-surface h-[42px]">
      <button
        onClick={handleDecrease}
        className="w-10 h-full hover:bg-surface-container transition-colors"
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="flex-grow text-center font-body-md">{quantity}</span>
      <button
        onClick={handleIncrease}
        className="w-10 h-full hover:bg-surface-container transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

// Cart Item Card Component - 1 Liner Design
const CartItemCard = ({ item, onRemove, onQuantityChange, onSizeChange }) => {
  return (
    <div className="bg-surface-container-lowest border border-secondary/10 group transition-all duration-500 hover:border-secondary/30">
      {/* Desktop: Single Row Layout */}
      <div className="hidden md:flex items-center gap-6 p-4">
        {/* Product Image */}
        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden">
          <Image
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            src={item.image}
            alt={item.imageAlt || item.title || item.name || ''}
            fill
            sizes="96px"
          />
        </div>
        
        {/* Product Info */}
        <div className="flex-grow min-w-0">
          <h3 className="font-headline-sm text-primary truncate">{item.title || item.name}</h3>
          <p className="font-label-sm text-secondary">{item.category}</p>
        </div>
        
        {/* Size/Color Selector */}
        <div className="w-32">
          {item.type === 'clothing' ? (
            <select
              value={item.size}
              onChange={(e) => onSizeChange(item.id, e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 font-body-md py-2 px-3 focus:border-secondary focus:ring-0 appearance-none rounded-none cursor-pointer"
            >
              {['Small', 'Medium', 'Large', 'Custom', 'S', 'M', 'L', 'XL'].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center space-x-2 h-[42px]">
              <div className="w-6 h-6 rounded-full bg-[#F5F5DC] border border-outline-variant/50 ring-2 ring-secondary ring-offset-2 flex-shrink-0" />
              <span className="font-body-md text-on-surface-variant">{item.color}</span>
            </div>
          )}
        </div>
        
        {/* Quantity */}
        <div className="w-32">
          <QuantitySelector
            quantity={item.quantity}
            onQuantityChange={(newQty) => onQuantityChange(item.id, newQty)}
          />
        </div>
        
        {/* Price */}
        <div className="w-32 text-right">
          <span className="font-headline-sm text-secondary">
            PKR {item.price.toLocaleString()}
          </span>
        </div>
        
        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.id)}
          className="text-outline hover:text-error transition-colors p-1 bg-transparent border-none cursor-pointer flex-shrink-0"
          aria-label={`Remove ${item.title || item.name} from cart`}
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Mobile: Condensed Layout */}
      <div className="md:hidden p-4 space-y-3">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden">
            <Image
              className="object-cover"
              src={item.image}
              alt={item.imageAlt || item.title || item.name || ''}
              fill
              sizes="80px"
            />
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-grow">
                <h3 className="font-headline-sm text-primary truncate pr-2">{item.title || item.name}</h3>
                <p className="font-label-sm text-secondary">{item.category}</p>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="text-outline hover:text-error transition-colors p-1 bg-transparent border-none cursor-pointer flex-shrink-0"
                aria-label={`Remove ${item.title || item.name} from cart`}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="mt-2 flex items-center gap-3">
              {item.type === 'clothing' ? (
                <select
                  value={item.size}
                  onChange={(e) => onSizeChange(item.id, e.target.value)}
                  className="w-24 bg-surface border border-outline-variant/30 font-body-md py-1.5 px-2 text-sm focus:border-secondary focus:ring-0 appearance-none rounded-none cursor-pointer"
                >
                  {['Small', 'Medium', 'Large', 'Custom'].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center space-x-1">
                  <div className="w-5 h-5 rounded-full bg-[#F5F5DC] border border-outline-variant/50 ring-2 ring-secondary ring-offset-2 flex-shrink-0" />
                  <span className="font-body-md text-sm text-on-surface-variant">{item.color}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Row: Quantity and Price */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-28">
            <QuantitySelector
              quantity={item.quantity}
              onQuantityChange={(newQty) => onQuantityChange(item.id, newQty)}
            />
          </div>
          <span className="font-headline-sm text-secondary">
            PKR {(item.price * item.quantity).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Order Summary Component
const OrderSummary = ({ subtotal, tax, total }) => {
  return (
    <div className="bg-white p-8 border border-secondary/20 shadow-sm">
      <h2 className="font-headline-sm text-primary mb-8 text-center uppercase tracking-wider">
        Order Summary
      </h2>
      <div className="space-y-6 mb-8">
        <div className="flex justify-between items-center">
          <span className="text-on-surface-variant font-body-md">Subtotal</span>
          <span className="text-primary font-bold">PKR {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-on-surface-variant font-body-md">Shipping Estimate</span>
          <span className="text-on-surface-variant italic font-body-md">
            Calculated at checkout
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-on-surface-variant font-body-md">Tax</span>
          <span className="text-primary font-bold">PKR {tax.toLocaleString()}</span>
        </div>
        <div className="luxury-line" />
        <div className="flex justify-between items-center pt-2">
          <span className="text-primary font-bold text-lg">Total</span>
          <span className="text-secondary font-bold text-2xl">
            PKR {total.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="space-y-4">
        <Link href="/checkout" className="w-full bg-primary text-white py-4 font-label-md tracking-widest uppercase transition-all duration-300 hover:bg-primary-container hover:scale-[1.02] active:scale-95 flex items-center justify-center">
          PROCEED TO CHECKOUT
          <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
        </Link>
        <p className="text-center text-[10px] text-outline-variant uppercase tracking-tighter leading-relaxed">
          Complimentary shipping on orders above PKR 10,000. All prices are inclusive of
          luxury VAT where applicable.
        </p>
      </div>
      <div className="mt-8 pt-8 border-t border-secondary/10 space-y-4">
        <div className="flex items-center text-on-surface-variant font-label-sm">
          <span className="material-symbols-outlined mr-3 text-secondary">verified_user</span>
          SECURE PREMIUM CHECKOUT
        </div>
        <div className="flex items-center text-on-surface-variant font-label-sm">
          <span className="material-symbols-outlined mr-3 text-secondary">local_shipping</span>
          EXPRESS GLOBAL COURIER
        </div>
      </div>
    </div>
  );
};

// Promo Code Section Component
const PromoCodeSection = ({ promoCode, onApplyPromo }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyPromo(code);
  };

  return (
    <div className="mt-6 p-6 border border-secondary/10 bg-surface-container-low">
      <label
        htmlFor="promo-code"
        className="block font-label-sm text-primary mb-3 uppercase tracking-widest"
      >
        Promotion Code
      </label>
      <form onSubmit={handleSubmit} className="flex">
        <input
          id="promo-code"
          className="flex-grow bg-white border border-outline-variant/30 px-4 py-2 font-label-sm focus:border-secondary focus:ring-0 rounded-none uppercase"
          placeholder="ENTER CODE"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          type="submit"
          className="bg-secondary text-white px-6 py-2 font-label-sm tracking-widest uppercase hover:bg-secondary-container transition-colors"
        >
          APPLY
        </button>
      </form>
      {promoCode.applied && (
        <p className="text-secondary font-label-sm mt-2">
          Code {promoCode.code} applied! Discount: PKR {promoCode.discount.toLocaleString()}
        </p>
      )}
    </div>
  );
};

// Main Cart Component
function Cart() {
  const { cartItems, removeFromCart, updateQuantity, updateSize } = useCart();

  const [promoCode, setPromoCode] = useState({
    code: '',
    applied: false,
    discount: 0,
  });

  const handleRemoveItem = useCallback((id) => {
    removeFromCart(id);
  }, [removeFromCart]);

  const handleQuantityChange = useCallback((id, quantity) => {
    updateQuantity(id, quantity);
  }, [updateQuantity]);

  const handleSizeChange = useCallback((id, size) => {
    updateSize(id, size);
  }, [updateSize]);

  const handleApplyPromo = useCallback((code) => {
    if (code.toUpperCase() === 'LUXE10') {
      setPromoCode({ code, applied: true, discount: 2570 });
    } else {
      alert('Invalid promo code');
    }
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = 0;
  const total = subtotal - promoCode.discount + tax;

  return (
    <>
      <main className="max-w-container-max mx-auto px-margin-desktop py-stack-lg min-h-screen">
        {/* Title Section */}
        <div className="text-center mb-stack-md">
          <h1 className="font-headline-md text-display-lg text-primary mb-2">
            Cart
          </h1>
          <p className="font-label-md text-secondary tracking-widest uppercase">
            Luxury Eastern Wear Collective
          </p>
          <div className="luxury-line mt-6 max-w-xs mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">
                  shopping_bag
                </span>
                <h2 className="font-headline-sm text-primary mb-2">Cart is empty</h2>
                <p className="text-on-surface-variant mb-6">
                  Discover our latest Eastern luxury collections
                </p>
                <Link
                  href="/new-arrivals"
                  className="inline-block bg-primary text-white px-8 py-3 font-label-md tracking-widest uppercase hover:bg-primary-container transition-colors"
                >
                  Shop New Arrivals
                </Link>
              </div>
            ) : (
              <>
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveItem}
                    onQuantityChange={handleQuantityChange}
                    onSizeChange={handleSizeChange}
                  />
                ))}
                <div className="pt-8 flex justify-between items-center">
                  <Link
                    className="font-label-md text-primary flex items-center group hover:text-secondary transition-colors"
                    href="/collection/lawn"
                  >
                    <span className="material-symbols-outlined mr-2 transition-transform group-hover:-translate-x-1">
                      arrow_back
                    </span>
                    CONTINUE SHOPPING
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <aside className="lg:col-span-4 sticky top-32">
            <OrderSummary subtotal={subtotal} tax={tax} total={total} />
            <PromoCodeSection promoCode={promoCode} onApplyPromo={handleApplyPromo} />
          </aside>
        </div>
      </main>
    </>
  );
}

export default Cart;