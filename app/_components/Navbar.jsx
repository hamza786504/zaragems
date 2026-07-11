// components/Navbar.jsx
'use client';
import Image from 'next/image';
import CartDrawer from './CartDrawer';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../store/cartContext';
import { useNavMenu } from '../store/navMenuContext';
import { useSiteSettings } from '../store/siteSettingsContext';
import {
  Menu,
  X,
  User,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function Navbar() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [isCartOpen, setIsCartOpen]       = useState(false);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  // ── Dynamic header menu, fetched server-side and provided via context ──────
  // so it's present in the very first render (no client-side fetch/flash).
  const navItems = useNavMenu();
  const settings = useSiteSettings();
  const logoSrc = settings?.logoUrl || '/logo.png';
  const storeName = settings?.storeName || 'Zaragems';

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const toggleSubmenu = (id) => {
    setActiveSubmenu(activeSubmenu === id ? null : id);
  };

  return (
    <>
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />

      <header className="bg-white docked w-full top-0 sticky z-50 border-b border-secondary/30 transition-transform duration-300">
        <div className="flex justify-between items-center max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-2 md:py-2">

          {/* Brand Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Image src={logoSrc} width="100" height="70" alt={storeName} />
            </Link>
          </div>

          {/* ── Desktop Navigation — dynamic from DB ──────────────────────── */}
          <nav className="hidden md:flex space-x-8 lg:space-x-10 items-center">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              return (
                <div key={item.id} className="relative group py-2">
                  <Link
                    href={item.url}
                    className="text-on-surface-variant font-label-md hover:text-secondary transition-colors duration-300 nav-link-underline flex items-center gap-1"
                  >
                    {item.title}
                    {hasChildren && (
                      <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                    )}
                  </Link>

                  {/* Children dropdown */}
                  {hasChildren && (
                    <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-surface border border-secondary/20 shadow-lg py-2 hidden group-hover:block transition-all duration-300 z-50 rounded-sm">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.url}
                          className="block px-4 py-2 font-label-md text-on-surface-variant hover:bg-secondary/10 hover:text-secondary transition-colors"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Actions (Right Side) */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <Link
              href="/login"
              className="text-primary hover:text-secondary transition-colors duration-300 active:scale-95 duration-150 ease-in-out flex items-center justify-center"
            >
              <User className="w-5 h-5 md:w-5 md:h-5" />
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-primary hover:text-secondary transition-colors duration-300 active:scale-95 duration-150 ease-in-out relative flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5 md:w-5 md:h-5" />
              <span className="absolute -top-2 -right-1 bg-secondary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            </button>

            {/* Hamburger — Mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-primary hover:text-secondary focus:outline-none flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay ──────────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-[80%] max-w-[360px] bg-surface shadow-2xl p-6 transition-transform duration-300 ease-in-out transform md:hidden ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-secondary/20 pb-4 mb-6">
          <span className="text-primary uppercase tracking-wider font-bold" style={{ fontSize: '16px' }}>
            {storeName}
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-primary hover:text-secondary focus:outline-none flex items-center justify-center"
            aria-label="Close Menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ── Mobile Navigation Links — Dynamic ────────────────────────── */}
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            return (
              <div key={item.id} className="flex flex-col">
                <div className="flex items-center justify-between py-2.5 border-b border-secondary/10">
                  <Link
                    href={item.url}
                    onClick={() => setMenuOpen(false)}
                    className="text-on-surface font-label-md hover:text-secondary transition-colors uppercase tracking-wider"
                  >
                    {item.title}
                  </Link>
                  {hasChildren && (
                    <button
                      onClick={() => toggleSubmenu(item.id)}
                      className="text-secondary/70 hover:text-secondary bg-transparent border-none flex items-center justify-center cursor-pointer p-1"
                    >
                      {activeSubmenu === item.id
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />
                      }
                    </button>
                  )}
                </div>

                {/* Mobile children accordion */}
                {hasChildren && (
                  <div
                    className={`pl-4 flex flex-col space-y-1 overflow-hidden transition-all duration-300 ${
                      activeSubmenu === item.id
                        ? 'max-h-60 opacity-100 mt-2 mb-1'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.url}
                        onClick={() => setMenuOpen(false)}
                        className="text-on-surface-variant font-label-md hover:text-secondary py-1.5 transition-colors text-sm block"
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}