'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../store/cartContext';
import { useAuth } from '../../store/authContext';

const DEFAULT_SHIPPING_CONFIG = {
    cod: true,
    bankDeposit: false,
    bankDetails: { accountTitle: '', accountNumber: '', bankName: '', iban: '' },
    standardCharge: 250,
    freeShippingThreshold: 10000,
    shippingMethods: [
        { id: 'standard', name: 'Standard Shipping', description: '3–5 Business Days', charge: 250, isDefault: true },
    ],
};

const countries = [
    'Country/Region',
    'Pakistan',
    'United Arab Emirates',
    'United Kingdom',
    'USA',
];

export default function CheckoutPage() {
    const { cartItems, clearCart } = useCart();
    const { customer, isAuthenticated } = useAuth();
    const [shippingConfig, setShippingConfig] = useState(DEFAULT_SHIPPING_CONFIG);
    const [accountType, setAccountType] = useState('new'); // 'new' or 'existing'
    const [formData, setFormData] = useState({
        email: '',
        newsletter: false,
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        country: 'Country/Region',
        postalCode: '',
        phone: '',
        discountCode: '',
        shippingMethod: 'standard',
        paymentMethod: 'cod',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null); // holds placed order details
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptUrl, setReceiptUrl] = useState('');
    const [receiptUploading, setReceiptUploading] = useState(false);

    // ── Saved addresses for logged-in customers ───────────────────────────────
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressKey, setSelectedAddressKey] = useState(null);
    const [addressesLoaded, setAddressesLoaded] = useState(false);

    const isLoggedIn = isAuthenticated && !!customer;

    // Map a saved address country value to one of the checkout country options.
    const toCheckoutCountry = (c) => {
        if (c === 'United States') return 'USA';
        return c || 'Country/Region';
    };

    // When the customer is logged in, load any saved addresses from their
    // address book and pre-fill the form so checkout is one-click.
    useEffect(() => {
        if (!isLoggedIn) return;
        let active = true;
        fetch('/api/account/addresses')
            .then((r) => r.json())
            .then((data) => {
                if (!active || !data.success) return;
                const addrs = Array.isArray(data.addresses) ? data.addresses : [];
                setSavedAddresses(addrs);
                // Auto-select the default (or first) address and fill the form.
                const preferred = addrs.find((a) => a.isDefault) || addrs[0];
                setSelectedAddressKey(preferred?._key || null);
                setFormData((prev) => ({
                    ...prev,
                    email: customer.email || prev.email,
                    firstName: preferred?.firstName || prev.firstName,
                    lastName: preferred?.lastName || prev.lastName,
                    address: preferred?.street || prev.address,
                    apartment: preferred?.apartment || prev.apartment,
                    city: preferred?.city || prev.city,
                    country: toCheckoutCountry(preferred?.country),
                    postalCode: preferred?.postalCode || prev.postalCode,
                    phone: preferred?.phone || prev.phone,
                }));
            })
            .catch(() => {})
            .finally(() => {
                if (active) setAddressesLoaded(true);
            });
        return () => {
            active = false;
        };
    }, [isLoggedIn, customer]);

    // Fill the shipping form from a saved address when the user picks one.
    const selectSavedAddress = (addr) => {
        setSelectedAddressKey(addr._key);
        setFormData((prev) => ({
            ...prev,
            firstName: addr.firstName || prev.firstName,
            lastName: addr.lastName || prev.lastName,
            address: addr.street || prev.address,
            apartment: addr.apartment || prev.apartment,
            city: addr.city || prev.city,
            country: toCheckoutCountry(addr.country),
            postalCode: addr.postalCode || prev.postalCode,
            phone: addr.phone || prev.phone,
        }));
        setErrors((prev) => ({
            ...prev,
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            country: '',
            phone: '',
        }));
    };

    const headerRef = useRef(null);
    const lastScrollRef = useRef(0);

    // ── Load shipping config from admin settings ─────────────────────────
    useEffect(() => {
        fetch('/api/settings/general')
            .then(r => r.json())
            .then(data => {
                if (data.success && data.settings?.shipping) {
                    const cfg = { ...DEFAULT_SHIPPING_CONFIG, ...data.settings.shipping };
                    if (!cfg.shippingMethods || cfg.shippingMethods.length === 0) {
                        cfg.shippingMethods = DEFAULT_SHIPPING_CONFIG.shippingMethods;
                    }
                    setShippingConfig(cfg);
                    const defaultMethod = cfg.shippingMethods.find(m => m.isDefault) || cfg.shippingMethods[0];
                    setFormData(prev => ({
                        ...prev,
                        shippingMethod: defaultMethod?.id || 'standard',
                        paymentMethod: cfg.cod ? 'cod' : cfg.bankDeposit ? 'bank' : 'cod',
                    }));
                }
            })
            .catch(err => console.error('Failed to load shipping config:', err));
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const formatPrice = (price) => {
        return `Rs. ${Number(price).toLocaleString()}`;
    };

    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const methods = shippingConfig.shippingMethods || DEFAULT_SHIPPING_CONFIG.shippingMethods;
    const selectedMethod = methods.find(m => m.id === formData.shippingMethod) || methods[0];
    // Free shipping when threshold is set and subtotal meets/exceeds it
    const isFreeShipping = shippingConfig.freeShippingThreshold > 0 && subtotal >= shippingConfig.freeShippingThreshold;
    const baseShippingCost = selectedMethod?.charge || shippingConfig.standardCharge;
    const shippingCost = isFreeShipping ? 0 : baseShippingCost;
    const total = subtotal + shippingCost;

    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setReceiptFile(file);
        setReceiptUploading(true);
        setErrors((prev) => ({ ...prev, receipt: '' }));
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
            setReceiptUrl(data.url);
        } catch (err) {
            setErrors((prev) => ({ ...prev, receipt: err.message }));
            setReceiptFile(null);
        } finally {
            setReceiptUploading(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.pageYOffset;
            const header = headerRef.current;
            if (header) {
                if (currentScroll > lastScrollRef.current && currentScroll > 100) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
                header.style.transition = 'transform 0.3s ease-out';
            }
            lastScrollRef.current = currentScroll;
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = 'Please enter a valid email address.';
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
        if (!formData.address.trim()) newErrors.address = 'Address is required.';
        if (!formData.city.trim()) newErrors.city = 'City is required.';
        if (formData.country === 'Country/Region') newErrors.country = 'Please select a country.';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
        else if (!/^[+\d\s\-()]{7,}$/.test(formData.phone))
            newErrors.phone = 'Please enter a valid phone number.';
        if (cartItems.length === 0) newErrors.cart = 'Your cart is empty.';

        // Validate password fields only for new (guest) accounts
        if (!isLoggedIn && accountType === 'new') {
            if (!formData.password) newErrors.password = 'Password is required.';
            else if (formData.password.length < 6)
                newErrors.password = 'Password must be at least 6 characters.';
            if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password.';
            else if (formData.password !== formData.confirmPassword)
                newErrors.confirmPassword = 'Passwords do not match.';
        }
        if (formData.paymentMethod === 'bank' && !receiptUrl) {
            newErrors.receipt = 'Please upload a payment receipt screenshot.';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            // Scroll to first error
            const firstErrorKey = Object.keys(validationErrors)[0];
            const el = document.getElementById(firstErrorKey);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsSubmitting(true);
        try {
            const orderPayload = {
                customer: {
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    email: formData.email,
                    avatar: `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase(),
                },
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                apartment: formData.apartment,
                city: formData.city,
                country: formData.country,
                postalCode: formData.postalCode,
                shippingMethod: formData.shippingMethod,
                shippingMethodName: selectedMethod?.name || 'Standard Shipping',
                shipping: shippingCost,
                paymentMethod: formData.paymentMethod,
                total,
                items: cartItems.reduce((acc, item) => acc + item.quantity, 0),
                paymentStatus: 'Pending',
                fulfillmentStatus: 'Unfulfilled',
                channel: 'Online Store',
                lineItems: cartItems.map((item) => ({
                    title: item.title,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                    price: item.price,
                })),
                // Include password only for new (guest) account creation
                ...(!isLoggedIn && accountType === 'new' && { password: formData.password }),
                ...(receiptUrl && { receiptUrl }),
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to place order.');
            }

            // Clear cart and show success overlay
            clearCart();
            setOrderSuccess({
                orderId: data.order.orderId,
                total,
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                address: [formData.address, formData.apartment, formData.city, formData.country]
                    .filter(Boolean)
                    .join(', '),
                shippingMethod: selectedMethod?.name || 'Standard Shipping',
            });
        } catch (err) {
            setErrors({ submit: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Success Overlay ──────────────────────────────────────────────────────────
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
                <div className="max-w-[600px] w-full bg-surface-container-low border border-secondary/10 p-10 md:p-14 flex flex-col items-center text-center gap-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-secondary">check_circle</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h1 className="font-headline-md text-headline-md text-primary">Order Confirmed!</h1>
                        <p className="text-body-md text-on-surface-variant">
                            Thank you, <span className="text-primary font-medium">{orderSuccess.name}</span>. Your order has been placed successfully.
                        </p>
                    </div>

                    <div className="w-full bg-surface border border-secondary/10 p-6 flex flex-col gap-4 text-left">
                        <div className="flex justify-between items-center border-b border-secondary/10 pb-4">
                            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Order ID</span>
                            <span className="font-label-md font-bold text-primary">{orderSuccess.orderId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Total</span>
                            <span className="font-headline-sm text-secondary">{formatPrice(orderSuccess.total)}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Ship To</span>
                            <span className="text-body-md text-primary text-right max-w-[60%]">{orderSuccess.address}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Shipping</span>
                            <span className="text-body-md text-primary capitalize">{orderSuccess.shippingMethod}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Confirmation sent to</span>
                            <span className="text-body-md text-primary">{orderSuccess.email}</span>
                        </div>
                    </div>

                    <p className="text-label-sm text-on-surface-variant">
                        Our team will contact you shortly to confirm delivery details.
                    </p>

                    <Link
                        href="/"
                        className="w-full bg-primary text-on-primary py-5 font-label-md text-label-md uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all border border-secondary/20 text-center"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    // ── Checkout Form ────────────────────────────────────────────────────────────
    return (
        <div className="bg-background text-on-surface font-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed">
            <style jsx global>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
                }
                body {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                .order-summary::-webkit-scrollbar { width: 4px; }
                .order-summary::-webkit-scrollbar-track { background: #fcf9f8; }
                .order-summary::-webkit-scrollbar-thumb { background: #e5e2e1; }
                .field-error { border-color: rgb(var(--error, 186 26 26)) !important; }
            `}</style>

            <main className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-stack-md md:py-stack-lg min-h-[calc(100vh-100px)]">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

                        {/* Left Panel */}
                        <div className="lg:col-span-7 space-y-12">

                            {/* Cart error */}
                            {errors.cart && (
                                <p className="text-error text-label-sm bg-error-container/20 px-4 py-3 border border-error/30">{errors.cart}</p>
                            )}
                            {errors.submit && (
                                <p className="text-error text-label-sm bg-error-container/20 px-4 py-3 border border-error/30">{errors.submit}</p>
                            )}

                            {/* Contact Information */}
                            <section>
                                <div className="flex justify-between items-end mb-6">
                                    <h2 className="text-headline-sm font-headline-sm text-primary">Contact Information</h2>
                                    {isLoggedIn ? (
                                        <span className="flex items-center gap-2 text-label-sm font-label-sm text-secondary">
                                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                            Logged in as {customer.email}
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    className="w-4 h-4 text-secondary focus:ring-secondary/20"
                                                    id="accountTypeNew"
                                                    name="accountType"
                                                    type="radio"
                                                    value="new"
                                                    checked={accountType === 'new'}
                                                    onChange={(e) => setAccountType(e.target.value)}
                                                />
                                                <label className="text-label-sm font-label-sm text-on-surface-variant" htmlFor="accountTypeNew">
                                                    New Account
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    className="w-4 h-4 text-secondary focus:ring-secondary/20"
                                                    id="accountTypeExisting"
                                                    name="accountType"
                                                    type="radio"
                                                    value="existing"
                                                    checked={accountType === 'existing'}
                                                    onChange={(e) => setAccountType(e.target.value)}
                                                />
                                                <label className="text-label-sm font-label-sm text-on-surface-variant" htmlFor="accountTypeExisting">
                                                    Already have an account
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <input
                                            className={`w-full bg-surface-container-low border-none border-b-2 focus:ring-0 py-4 px-4 transition-all duration-300 placeholder:text-outline-variant text-body-md focus:scale-[1.01] ${errors.email ? 'border-b-2 border-error' : 'border-outline-variant focus:border-secondary'}`}
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="Email address"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            readOnly={isLoggedIn}
                                        />
                                        {errors.email && <p className="text-error text-[11px] mt-1 px-1">{errors.email}</p>}
                                    </div>

                                    {/* Password fields for new account */}
                                    {!isLoggedIn && accountType === 'new' && (
                                        <>
                                            <div className="relative group">
                                                <input
                                                    className={`w-full bg-surface-container-low border-none border-b-2 focus:ring-0 py-4 px-4 transition-all duration-300 placeholder:text-outline-variant text-body-md focus:scale-[1.01] ${errors.password ? 'border-b-2 border-error' : 'border-outline-variant focus:border-secondary'}`}
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    placeholder="Password (min 6 characters)"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                />
                                                {errors.password && <p className="text-error text-[11px] mt-1 px-1">{errors.password}</p>}
                                            </div>
                                            <div className="relative group">
                                                <input
                                                    className={`w-full bg-surface-container-low border-none border-b-2 focus:ring-0 py-4 px-4 transition-all duration-300 placeholder:text-outline-variant text-body-md focus:scale-[1.01] ${errors.confirmPassword ? 'border-b-2 border-error' : 'border-outline-variant focus:border-secondary'}`}
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    placeholder="Confirm Password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                />
                                                {errors.confirmPassword && <p className="text-error text-[11px] mt-1 px-1">{errors.confirmPassword}</p>}
                                            </div>
                                        </>
                                    )}

                                    <div className="flex items-center gap-3 py-2">
                                        <input
                                            className="w-4 h-4 rounded-none border-secondary text-secondary focus:ring-secondary/20"
                                            id="news"
                                            name="newsletter"
                                            type="checkbox"
                                            checked={formData.newsletter}
                                            onChange={handleInputChange}
                                        />
                                        <label className="text-label-sm font-label-sm text-on-surface-variant" htmlFor="news">
                                            Email me with news and offers
                                        </label>
                                    </div>
                                </div>
                            </section>

                            {/* Shipping Address */}
                            <section className="pt-4 space-y-6">
                                <h2 className="text-headline-sm font-headline-sm text-primary">Shipping Address</h2>

                                {/* Saved addresses from the customer's address book */}
                                {isLoggedIn && (
                                    <div className="space-y-3">
                                        {!addressesLoaded ? (
                                            <p className="text-label-sm text-on-surface-variant flex items-center gap-2">
                                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                                Loading saved addresses…
                                            </p>
                                        ) : savedAddresses.length > 0 ? (
                                            <>
                                                <p className="text-label-sm text-on-surface-variant">
                                                    Choose a saved address or fill in the form below.
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {savedAddresses.map((addr) => {
                                                        const selected = addr._key === selectedAddressKey;
                                                        return (
                                                            <label
                                                                key={addr._key}
                                                                className={`flex items-start gap-3 text-left p-4 border cursor-pointer transition-all duration-200 ${
                                                                    selected
                                                                        ? 'border-secondary bg-secondary/5'
                                                                        : 'border-secondary/20 hover:border-secondary/60'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name="savedAddress"
                                                                    value={addr._key}
                                                                    checked={selected}
                                                                    onChange={() => selectSavedAddress(addr)}
                                                                    className="mt-1 w-4 h-4 text-secondary focus:ring-secondary/20 border-secondary"
                                                                />
                                                                <span className="flex-1">
                                                                    <span className="flex items-center justify-between mb-1">
                                                                        <span className="font-label-sm font-label-sm text-primary uppercase tracking-wider">
                                                                            {`${addr.firstName || ''} ${addr.lastName || ''}`.trim() || 'Address'}
                                                                        </span>
                                                                        {addr.isDefault && (
                                                                            <span className="text-[10px] uppercase tracking-wider text-secondary">
                                                                                Default
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                    <span className="block text-label-sm text-on-surface-variant leading-snug">
                                                                        {[addr.street, addr.apartment, addr.city, addr.country]
                                                                            .filter(Boolean)
                                                                            .join(', ')}
                                                                    </span>
                                                                    {addr.phone && (
                                                                        <span className="block text-label-sm text-on-surface-variant mt-1">{addr.phone}</span>
                                                                    )}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-label-sm text-on-surface-variant">
                                                No saved addresses yet — add one from your{' '}
                                                <Link href="/address" className="text-secondary underline">
                                                    Address Book
                                                </Link>{' '}
                                                or fill in the form below.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            className={`w-full bg-surface-container-low border-none border-b-2 focus:ring-0 py-4 px-4 transition-all duration-300 focus:scale-[1.01] ${errors.firstName ? 'border-b-2 border-error' : 'border-outline-variant focus:border-secondary'}`}
                                            id="firstName"
                                            placeholder="First name"
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                        />
                                        {errors.firstName && <p className="text-error text-[11px] mt-1 px-1">{errors.firstName}</p>}
                                    </div>
                                    <div>
                                        <input
                                            className={`w-full bg-surface-container-low border-none border-b-2 focus:ring-0 py-4 px-4 transition-all duration-300 focus:scale-[1.01] ${errors.lastName ? 'border-b-2 border-error' : 'border-outline-variant focus:border-secondary'}`}
                                            id="lastName"
                                            placeholder="Last name"
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                        />
                                        {errors.lastName && <p className="text-error text-[11px] mt-1 px-1">{errors.lastName}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <input
                                            className={`w-full bg-surface-container-low border-none border-b-2 focus:ring-0 py-4 px-4 transition-all duration-300 focus:scale-[1.01] ${errors.address ? 'border-b-2 border-error' : 'border-outline-variant focus:border-secondary'}`}
                                            id="address"
                                            placeholder="Address"
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                        />
                                        {errors.address && <p className="text-error text-[11px] mt-1 px-1">{errors.address}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <input
                                            className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:border-secondary focus:ring-0 py-4 px-4 transition-all duration-300 focus:scale-[1.01]"
                                            placeholder="Apartment, suite, etc. (optional)"
                                            type="text"
                                            name="apartment"
                                            value={formData.apartment}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            className={`w-full bg-surface-container-low border-none border-b-2 focus:ring-0 py-4 px-4 transition-all duration-300 focus:scale-[1.01] ${errors.city ? 'border-b-2 border-error' : 'border-outline-variant focus:border-secondary'}`}
                                            id="city"
                                            placeholder="City"
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                        />
                                        {errors.city && <p className="text-error text-[11px] mt-1 px-1">{errors.city}</p>}
                                    </div>
                                    <div className="relative">
                                        <select
                                            className={`w-full bg-surface-container-low border-none border-b-2 focus:ring-0 py-4 px-4 appearance-none transition-all duration-300 text-on-surface-variant focus:scale-[1.01] ${errors.country ? 'border-b-2 border-error' : 'border-outline-variant focus:border-secondary'}`}
                                            id="country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                        >
                                            {countries.map((country) => (
                                                <option key={country} value={country}>{country}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                                        {errors.country && <p className="text-error text-[11px] mt-1 px-1">{errors.country}</p>}
                                    </div>
                                    <div>
                                        <input
                                            className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:border-secondary focus:ring-0 py-4 px-4 transition-all duration-300 focus:scale-[1.01]"
                                            placeholder="Postal code (optional)"
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            className={`w-full bg-surface-container-low border-none border-b-2 focus:ring-0 py-4 px-4 transition-all duration-300 focus:scale-[1.01] ${errors.phone ? 'border-b-2 border-error' : 'border-outline-variant focus:border-secondary'}`}
                                            id="phone"
                                            placeholder="Phone"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                        {errors.phone && <p className="text-error text-[11px] mt-1 px-1">{errors.phone}</p>}
                                    </div>
                                </div>
                            </section>

                            {/* Shipping Method — selectable options */}
                            <section className="pt-4 space-y-6">
                                <h2 className="text-headline-sm font-headline-sm text-primary">Shipping Method</h2>
                                <div className="border border-secondary/10 bg-surface-container-low overflow-hidden divide-y divide-secondary/10">
                                    {methods.map((method) => (
                                        <label
                                            key={method.id}
                                            className={`flex items-center gap-4 p-5 cursor-pointer hover:bg-surface-container-high transition-colors ${formData.shippingMethod === method.id ? 'bg-secondary/5' : ''}`}
                                        >
                                            <input
                                                className="w-4 h-4 text-secondary focus:ring-secondary/20 border-secondary"
                                                name="shippingMethod"
                                                type="radio"
                                                value={method.id}
                                                checked={formData.shippingMethod === method.id}
                                                onChange={handleInputChange}
                                            />
                                            <div className="flex-1">
                                                <span className="text-body-md font-label-md text-primary block">{method.name}</span>
                                                {method.description && (
                                                    <span className="text-body-sm text-on-surface-variant">{method.description}</span>
                                                )}
                                            </div>
                                            <span className="text-label-md font-label-md text-primary">
                                                {isFreeShipping ? (
                                                    <>
                                                        <span className="line-through text-on-surface-variant mr-1">{formatPrice(method.charge)}</span>
                                                        <span className="text-primary font-bold">FREE</span>
                                                    </>
                                                ) : (
                                                    formatPrice(method.charge)
                                                )}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {isFreeShipping && (
                                    <p className="text-body-sm text-primary flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-base">local_shipping</span>
                                        Free shipping applied — your order exceeds Rs. {shippingConfig.freeShippingThreshold.toLocaleString()}!
                                    </p>
                                )}
                            </section>

                            {/* Payment Information */}
                            <section className="pt-4 space-y-6">
                                <div className="flex flex-col">
                                    <h2 className="text-headline-sm font-headline-sm text-primary">Payment Method</h2>
                                    <p className="text-label-sm font-label-sm text-on-surface-variant">All transactions are secure and encrypted.</p>
                                </div>
                                <div className="border border-secondary/10 bg-surface-container-low overflow-hidden divide-y divide-secondary/10">
                                    {/* Cash on Delivery */}
                                    {shippingConfig.cod && (
                                        <label className="flex items-center gap-4 p-5 cursor-pointer hover:bg-surface-container-high transition-colors">
                                            <input
                                                className="w-4 h-4 text-secondary focus:ring-secondary/20 border-secondary"
                                                name="paymentMethod"
                                                type="radio"
                                                value="cod"
                                                checked={formData.paymentMethod === 'cod'}
                                                onChange={handleInputChange}
                                            />
                                            <div>
                                                <span className="text-body-md font-label-md text-primary block">Cash on Delivery (COD)</span>
                                                <span className="text-body-sm text-on-surface-variant">Pay in cash when your order arrives</span>
                                            </div>
                                        </label>
                                    )}

                                    {/* Bank Deposit */}
                                    {shippingConfig.bankDeposit && (
                                        <label className="flex items-center gap-4 p-5 cursor-pointer hover:bg-surface-container-high transition-colors">
                                            <input
                                                className="w-4 h-4 text-secondary focus:ring-secondary/20 border-secondary"
                                                name="paymentMethod"
                                                type="radio"
                                                value="bank"
                                                checked={formData.paymentMethod === 'bank'}
                                                onChange={handleInputChange}
                                            />
                                            <div>
                                                <span className="text-body-md font-label-md text-primary block">Bank Deposit</span>
                                                <span className="text-body-sm text-on-surface-variant">Transfer to our bank account before delivery</span>
                                            </div>
                                        </label>
                                    )}
                                </div>

                                {/* Bank details info box — shown when bank deposit is selected */}
                                {formData.paymentMethod === 'bank' && shippingConfig.bankDeposit && (
                                    <div className="border border-secondary/20 bg-surface-container-low p-5 space-y-3">
                                        <p className="text-label-md font-bold text-primary flex items-center gap-2">
                                            <span className="material-symbols-outlined text-base">account_balance</span>
                                            Bank Transfer Details
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-md">
                                            {shippingConfig.bankDetails.accountTitle && (
                                                <div>
                                                    <span className="text-on-surface-variant text-xs uppercase tracking-wide block mb-0.5">Account Title</span>
                                                    <span className="font-medium text-on-surface">{shippingConfig.bankDetails.accountTitle}</span>
                                                </div>
                                            )}
                                            {shippingConfig.bankDetails.bankName && (
                                                <div>
                                                    <span className="text-on-surface-variant text-xs uppercase tracking-wide block mb-0.5">Bank</span>
                                                    <span className="font-medium text-on-surface">{shippingConfig.bankDetails.bankName}</span>
                                                </div>
                                            )}
                                            {shippingConfig.bankDetails.accountNumber && (
                                                <div>
                                                    <span className="text-on-surface-variant text-xs uppercase tracking-wide block mb-0.5">Account Number</span>
                                                    <span className="font-medium text-on-surface font-mono">{shippingConfig.bankDetails.accountNumber}</span>
                                                </div>
                                            )}
                                            {shippingConfig.bankDetails.iban && (
                                                <div>
                                                    <span className="text-on-surface-variant text-xs uppercase tracking-wide block mb-0.5">IBAN</span>
                                                    <span className="font-medium text-on-surface font-mono text-sm">{shippingConfig.bankDetails.iban}</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-body-sm text-on-surface-variant border-t border-secondary/10 pt-3">
                                            ⚠️ Please transfer the exact order total and send a payment screenshot to confirm. Your order will be processed after payment is verified.
                                        </p>
                                        <div className="border-t border-secondary/10 pt-4">
                                            <p className="text-label-md font-bold text-primary mb-3">Upload Payment Receipt</p>
                                            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-secondary/30 rounded cursor-pointer hover:border-secondary transition-colors bg-surface-container-lowest">
                                                {receiptUrl ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="material-symbols-outlined text-3xl text-secondary">check_circle</span>
                                                        <span className="text-label-sm text-secondary">Receipt uploaded</span>
                                                        <span className="text-label-sm text-on-surface-variant">Tap to replace</span>
                                                    </div>
                                                ) : receiptUploading ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="material-symbols-outlined animate-spin text-3xl text-secondary">progress_activity</span>
                                                        <span className="text-label-sm text-on-surface-variant">Uploading…</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="material-symbols-outlined text-3xl text-on-surface-variant">cloud_upload</span>
                                                        <span className="text-label-sm text-on-surface-variant">Click to upload receipt screenshot</span>
                                                        <span className="text-label-sm text-on-surface-variant/60">PNG, JPG up to 5MB</span>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleReceiptUpload} disabled={receiptUploading} />
                                            </label>
                                            {errors.receipt && <p className="text-error text-[11px] mt-2">{errors.receipt}</p>}
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Navigation */}
                            <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-6">
                                <Link
                                    href="/cart"
                                    className="flex items-center gap-2 text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors group"
                                >
                                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                    Return to cart
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto bg-primary text-on-primary px-16 py-5 font-label-md text-label-md uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all border border-secondary/20 shadow-lg shadow-primary/5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                            Placing Order...
                                        </>
                                    ) : (
                                        'Complete Purchase'
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Right Panel: Order Summary */}
                        <aside className="lg:col-span-5 bg-surface-container-low p-8 md:p-10 sticky top-32 border border-secondary/5">
                            <h3 className="text-headline-sm font-headline-sm text-primary mb-8">Order Summary</h3>

                            {/* Product List */}
                            <div className="order-summary space-y-6 max-h-[400px] overflow-y-auto pr-4 mb-8">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-6 group">
                                        <div className="relative w-20 h-24 bg-surface-container flex-shrink-0 overflow-hidden">
                                            <Image className="object-cover" alt={item.title || ''} src={item.image} fill sizes="80px" />
                                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-secondary text-on-secondary text-[10px] flex items-center justify-center rounded-full font-bold">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex flex-col justify-center flex-grow">
                                            <h4 className="text-body-md font-bold text-primary group-hover:text-secondary transition-colors">{item.title}</h4>
                                            <p className="text-label-sm font-label-sm text-on-surface-variant">
                                                Size: {item.size} {item.color && item.color !== 'Default' ? `/ Color: ${item.color}` : ''}
                                            </p>
                                        </div>
                                        <div className="flex flex-col justify-center items-end">
                                            <p className="text-body-md font-headline-md text-primary">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                                {cartItems.length === 0 && (
                                    <p className="text-on-surface-variant italic text-sm">No items in your cart.</p>
                                )}
                            </div>

                            {/* Discount Code */}
                            <div className="flex gap-4 mb-8">
                                <input
                                    className="flex-grow bg-surface border-none border-b-2 border-outline-variant focus:border-secondary focus:ring-0 py-3 px-4 transition-all duration-300 text-sm"
                                    placeholder="Discount code"
                                    type="text"
                                    name="discountCode"
                                    value={formData.discountCode}
                                    onChange={handleInputChange}
                                />
                                <button type="button" className="bg-surface-container-highest text-primary px-6 py-3 text-label-sm font-label-md uppercase tracking-wider hover:bg-secondary-container transition-colors">
                                    Apply
                                </button>
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 border-t border-secondary/10 pt-8">
                                <div className="flex justify-between">
                                    <span className="text-body-md text-on-surface-variant">Subtotal</span>
                                    <span className="text-body-md font-medium text-primary">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-body-md text-on-surface-variant">Shipping</span>
                                    {isFreeShipping ? (
                                        <span className="text-body-md font-medium text-primary">
                                            <span className="line-through text-on-surface-variant/50 mr-1">{formatPrice(baseShippingCost)}</span>
                                            FREE
                                        </span>
                                    ) : (
                                        <span className="text-body-md font-medium text-primary">{formatPrice(shippingCost)}</span>
                                    )}
                                </div>
                                <div className="flex justify-between border-t border-secondary/10 pt-4 mt-4">
                                    <span className="text-headline-sm font-headline-sm text-primary">Total</span>
                                    <div className="text-right">
                                        <span className="text-label-sm font-label-sm text-on-surface-variant block">PKR</span>
                                        <span className="text-headline-md font-headline-md text-secondary">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-8 text-label-sm font-label-sm text-on-surface-variant flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">lock</span>
                                Secure checkout. All data is encrypted.
                            </p>
                        </aside>
                    </div>
                </form>
            </main>
        </div>
    );
}