// app/_components/Admin/Header.jsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Store,
  User,
  Menu,
  X,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Plus,
  ShoppingCart,
  Star,
  AlertTriangle,
  CreditCard,
  Info,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { isAdminAuthenticated, decodeAdminToken } from '@/lib/auth';
import { adminNavItems } from './adminNav';
import SettingsSubNav from './SettingsSubNav';

// ── helpers ────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const now = Date.now();
  const diff = Math.max(0, now - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

const TYPE_META = {
  new_order:  { icon: ShoppingCart, color: 'text-blue-500',   bg: 'bg-blue-50'   },
  low_stock:  { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50'  },
  new_review: { icon: Star,          color: 'text-yellow-500', bg: 'bg-yellow-50' },
  payment:    { icon: CreditCard,    color: 'text-green-500',  bg: 'bg-green-50'  },
  system:     { icon: Info,          color: 'text-slate-500',  bg: 'bg-slate-50'  },
};

function NotifIcon({ type }) {
  const meta = TYPE_META[type] || TYPE_META.system;
  const Icon = meta.icon;
  return (
    <div className={`w-8 h-8 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-4 h-4 ${meta.color}`} />
    </div>
  );
}
// ───────────────────────────────────────────────────────────────────────────

function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // ── search state ─────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResults, setSearchResults]     = useState([]);
  const [isSearching, setIsSearching]         = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // ── UI toggles ────────────────────────────────────────────────────────────
  const [isMobileMenuOpen, setIsMobileMenuOpen]   = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen]         = useState(false);

  // ── auth ──────────────────────────────────────────────────────────────────
  const [adminData, setAdminData]   = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // ── notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications]       = useState([]);
  const [unreadCount, setUnreadCount]           = useState(0);
  const [loadingNotifs, setLoadingNotifs]       = useState(false);
  const [notifsFetched, setNotifsFetched]       = useState(false);   // fetched at least once

  const searchRef      = useRef(null);
  const notificationRef = useRef(null);
  const profileRef     = useRef(null);
  const pollRef        = useRef(null);

  // Mock product data for search
  const mockProducts = [
    { id: 1, name: 'Handmade Ceramic Vase',   price: '$45.00', category: 'Home Decor'   },
    { id: 2, name: 'Organic Cotton T-Shirt',  price: '$29.99', category: 'Apparel'      },
    { id: 3, name: 'Bamboo Cutting Board',    price: '$34.50', category: 'Kitchen'      },
    { id: 4, name: 'Leather Wallet',          price: '$59.00', category: 'Accessories'  },
    { id: 5, name: 'Scented Candle Set',      price: '$24.99', category: 'Home Decor'   },
    { id: 6, name: 'Wooden Phone Stand',      price: '$19.99', category: 'Electronics'  },
  ];

  // ── fetch unread count (lightweight) ─────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread-count');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count ?? 0);
      }
    } catch { /* silent */ }
  }, []);

  // ── fetch notifications for dropdown ─────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const res = await fetch('/api/notifications?limit=8&page=1');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        const unread = (data.notifications || []).filter(n => !n.isRead).length;
        setUnreadCount(prev => Math.max(prev, unread));
        setNotifsFetched(true);
      }
    } catch { /* silent */ } finally {
      setLoadingNotifs(false);
    }
  }, []);

  // ── mark one notification as read ─────────────────────────────────────────
  const markRead = useCallback(async (id) => {
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id], isRead: true }),
    }).catch(() => {});
  }, []);

  // ── mark all read ─────────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true, isRead: true }),
    }).catch(() => {});
  }, []);

  // ── auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingAuth(true);
    if (typeof window !== 'undefined') {
      if (isAdminAuthenticated()) {
        const decoded = decodeAdminToken();
        if (decoded) {
          setAdminData({
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
            role: decoded.role,
          });
        }
      }
    }
    setLoadingAuth(false);
  }, []);

  // ── initial unread count + 30s poll ───────────────────────────────────────
  useEffect(() => {
    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(pollRef.current);
  }, [fetchUnreadCount]);

  // ── fetch full list when dropdown opens ───────────────────────────────────
  useEffect(() => {
    if (isNotificationsOpen && !notifsFetched) {
      fetchNotifications();
    }
    // refresh each time dropdown opens
    if (isNotificationsOpen) {
      fetchNotifications();
    }
  }, [isNotificationsOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── search debounce ───────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        const filtered = mockProducts.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
        setShowSearchResults(true);
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── click-outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSearchResults(false);
      if (notificationRef.current && !notificationRef.current.contains(e.target))
        setIsNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── lock body scroll while the mobile drawer is open ───────────────────────
  useEffect(() => {
    if (isMobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isMobileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  const handleProductClick = (id) => {
    router.push(`/products/${id}`);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) { router.push('/admin/login'); router.refresh(); }
    } catch (err) { console.error('Logout error:', err); }
  };

  const handleNotifClick = (notif) => {
    if (!notif.isRead) markRead(notif._id);
    if (notif.link) {
      router.push(notif.link);
      setIsNotificationsOpen(false);
    }
  };

  return (
    <>
      {/* ── TopNavBar ──────────────────────────────────────────────────────── */}
      <header className="fixed top-0 right-0 left-0 lg:left-60 h-16 bg-surface border-b border-outline-variant shadow-sm z-40 flex justify-between items-center px-4 sm:px-6 lg:px-8">

        {/* Left Section */}
        <div className="flex items-center gap-3 lg:gap-6 flex-1 min-w-0">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo — Mobile */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <span className="text-headline-md font-headline-md font-extrabold text-primary truncate">Shop</span>
          </Link>

          {/* Search Bar — Desktop */}
          <div className="hidden lg:flex relative flex-1 max-w-[300px]" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/60"
                  placeholder="Search..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setShowSearchResults(false)}
                  onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                  aria-label="Search"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                      Products ({searchResults.length})
                    </div>
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleProductClick(p.id)}
                        className="w-full px-4 py-2 hover:bg-surface-container-high transition-colors flex items-center gap-3 text-left"
                      >
                        <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-on-surface-variant" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-body-md font-medium truncate">{p.name}</p>
                          <p className="text-body-sm text-on-surface-variant truncate">{p.category} • {p.price}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-on-surface-variant rotate-[-90deg] flex-shrink-0" />
                      </button>
                    ))}
                    <div className="border-t border-outline-variant px-4 py-3">
                      <button
                        onClick={handleSearch}
                        className="w-full text-center text-primary text-body-sm font-medium hover:underline flex items-center justify-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        View all results for &quot;{searchQuery}&quot;
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
                    <p className="text-body-md font-medium text-on-surface">No products found</p>
                    <p className="text-body-sm text-on-surface-variant mt-1">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Button — Mobile */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Search"
            onClick={() => {
              const input = document.querySelector('input[placeholder*="Search"]');
              if (input) input.focus();
            }}
          >
            <Search className="w-5 h-5 text-on-surface-variant" />
          </button>

          {/* ── Notifications ────────────────────────────────────────────── */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg hover:bg-surface-container transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-on-surface-variant" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl overflow-hidden z-50">
                {/* Header */}
                <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-on-surface text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-error/10 text-error text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/40">
                  {loadingNotifs && notifications.length === 0 ? (
                    <div className="flex flex-col gap-3 p-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-3 items-start animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-surface-container flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-surface-container rounded w-3/4" />
                            <div className="h-2.5 bg-surface-container rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <Bell className="w-10 h-10 text-on-surface-variant/20 mx-auto mb-3" />
                      <p className="text-sm text-on-surface-variant">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotifClick(notif)}
                        className={`px-4 py-3 flex gap-3 items-start cursor-pointer transition-colors hover:bg-surface-container-high ${
                          !notif.isRead ? 'bg-primary/5' : ''
                        }`}
                      >
                        <NotifIcon type={notif.type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-on-surface' : 'text-on-surface'}`}>
                              {notif.title}
                            </p>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                            )}
                          </div>
                          {notif.message && (
                            <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{notif.message}</p>
                          )}
                          <p className="text-[11px] text-on-surface-variant/60 mt-1">{timeAgo(notif.createdAt)}</p>
                        </div>
                        {notif.link && (
                          <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant/40 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-outline-variant text-center">
                  <Link
                    href="/admin/notifications"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    View all notifications
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Store Selector */}
          <Link
            target="_blank"
            href="/"
            className="hidden sm:flex items-center gap-2 p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary"
          >
            <Store className="w-5 h-5" />
            <span className="text-body-sm font-medium hidden md:inline">My Store</span>
          </Link>

          {/* Profile */}
          {loadingAuth ? (
            <div className="flex items-center gap-2 p-1.5 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                <User className="w-4 h-4" />
              </div>
            </div>
          ) : !adminData ? (
            <Link
              href="/admin/login"
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container transition-colors"
            >
              <User className="w-4 h-4 text-on-surface-variant" />
              <span className="text-body-sm font-medium text-on-surface-variant">Login</span>
            </Link>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                aria-label="Profile"
              >
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                  <User className="w-4 h-4" />
                </div>
                <ChevronDown className="w-4 h-4 text-on-surface-variant hidden md:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-outline-variant">
                    <p className="font-body-md font-bold text-on-surface">{adminData?.username || 'Admin'}</p>
                    <p className="text-body-sm text-on-surface-variant">{adminData?.role || 'Admin'}</p>
                    <p className="text-body-sm text-on-surface-variant truncate">{adminData?.email || ''}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full px-4 py-2.5 hover:bg-surface-container-high transition-colors flex items-center gap-3 text-left">
                      <User className="w-4 h-4 text-on-surface-variant" />
                      <span className="text-body-md">My Profile</span>
                    </button>
                    <button className="w-full px-4 py-2.5 hover:bg-surface-container-high transition-colors flex items-center gap-3 text-left">
                      <ShoppingBag className="w-4 h-4 text-on-surface-variant" />
                      <span className="text-body-md">Orders</span>
                    </button>
                    <button className="w-full px-4 py-2.5 hover:bg-surface-container-high transition-colors flex items-center gap-3 text-left">
                      <Settings className="w-4 h-4 text-on-surface-variant" />
                      <span className="text-body-md">Settings</span>
                    </button>
                  </div>
                  <div className="border-t border-outline-variant py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 hover:bg-surface-container-high transition-colors flex items-center gap-3 text-left text-error"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-body-md">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile Sidebar Drawer ──────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer — full nav, shares adminNavItems with the desktop sidebar */}
          <aside className="fixed top-0 left-0 w-64 h-full bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant z-50 lg:hidden flex flex-col animate-slide-in">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <div>
                <h1 className="text-headline-md font-headline-md font-bold text-on-surface">Merchant Admin</h1>
                <p className="text-body-sm text-on-surface-variant">Manage your store</p>
              </div>
              {/* Close button — dismisses the drawer on mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-container-high transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="relative flex-1 p-4 overflow-hidden">
              {/* Main menu layer */}
              <div
                className={
                  'absolute inset-0 p-4 space-y-1 overflow-y-auto transition-all duration-300 ease-in-out ' +
                  (pathname.startsWith('/admin/settings')
                    ? 'opacity-0 -translate-x-4 pointer-events-none'
                    : 'opacity-100 translate-x-0')
                }
              >
                {adminNavItems.map((item) => {
                  const active = item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={
                        active
                          ? 'flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold bg-primary-container/10 transition-colors'
                          : 'flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors'
                      }
                    >
                      <Icon size={20} />
                      <span className="text-body-md">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Settings sub-menu layer */}
              <div
                className={
                  'absolute inset-0 p-4 overflow-y-auto transition-all duration-300 ease-in-out ' +
                  (pathname.startsWith('/admin/settings')
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-4 pointer-events-none')
                }
              >
                <SettingsSubNav
                  variant="mobile"
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </nav>

            <div className="p-4 border-t border-outline-variant">
              {adminData ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-body-md">Logout</span>
                </button>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-primary hover:bg-primary-container/10 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-body-md">Login</span>
                </Link>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}

export default Header;