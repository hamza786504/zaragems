'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../_components/Navbar';
import Sidebar from '../../_components/Dashboard/Sidebar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../store/authContext';
import { AuthGuard } from '../../_components/AuthGuard';

// Sample addresses data
const initialAddresses = [
    {
        id: 'addr-1',
        name: 'Zahra Mansoor',
        street: '42 Heritage Enclave, Street 7',
        city: 'Gulberg III, Lahore',
        province: 'Punjab, 54000',
        country: 'Pakistan',
        phone: '+92 300 1234567',
        type: 'Default Shipping',
        typeColor: 'bg-secondary-container/30 text-secondary',
    },
    {
        id: 'addr-2',
        name: 'Zahra Mansoor',
        street: 'Studio 304, Art District',
        city: 'Phase 5, DHA',
        province: 'Karachi, 75500',
        country: 'Pakistan',
        phone: '+92 321 9876543',
        type: 'Work',
        typeColor: 'bg-surface-container-high text-on-surface-variant',
    },
];

// Navigation items
const navItems = [
    { id: 'dashboard', icon: 'grid_view', label: 'Dashboard' },
    { id: 'orders', icon: 'package_2', label: 'Orders' },
    { id: 'profile', icon: 'person', label: 'Profile' },
    { id: 'address', icon: 'menu_book', label: 'Address Book' },
    { id: 'account', icon: 'manage_accounts', label: 'Account Details' },
];

// Countries list
const countries = ['Pakistan', 'United Arab Emirates', 'United Kingdom', 'United States'];

// Initial form data
const initialFormData = {
    firstName: '',
    lastName: '',
    street: '',
    apartment: '',
    city: '',
    country: 'Pakistan',
    postalCode: '',
    phone: '',
    isDefault: false,
};

export default function AddressBookPage() {
    const { customer, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addresses, setAddresses] = useState(initialAddresses);
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    // Map DB address shape -> card shape used by the UI
    const mapAddress = (a) => ({
        id: a._key,
        name: `${a.firstName || ''} ${a.lastName || ''}`.trim(),
        street: a.street,
        city: [a.city, a.apartment].filter(Boolean).join(', '),
        province: [a.postalCode, a.country].filter(Boolean).join(', '),
        country: a.country,
        phone: a.phone,
        type: a.isDefault ? 'Default Shipping' : 'Other',
        typeColor: a.isDefault
            ? 'bg-secondary-container/30 text-secondary'
            : 'bg-surface-container-high text-on-surface-variant',
    });

    // Load saved addresses for the logged-in customer
    const loadAddresses = async () => {
        setLoadingAddresses(true);
        try {
            const res = await fetch('/api/account/addresses');
            const data = await res.json();
            if (data.success && Array.isArray(data.addresses)) {
                setAddresses(data.addresses.map(mapAddress));
            }
        } catch {
            // keep sample fallback on error
        } finally {
            setLoadingAddresses(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) loadAddresses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    // Toggle form modal
    const toggleForm = () => {
        if (showForm) {
            setShowForm(false);
            setEditingAddress(null);
            setFormData(initialFormData);
            document.body.style.overflow = '';
        } else {
            setShowForm(true);
            document.body.style.overflow = 'hidden';
        }
    };

    // Handle edit address
    const handleEdit = (address) => {
        const nameParts = address.name.split(' ');
        setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            street: address.street,
            apartment: '',
            city: address.city,
            country: address.country,
            postalCode: address.province.split(', ')[1] || '',
            phone: address.phone,
            isDefault: address.type === 'Default Shipping',
        });
        setEditingAddress(address.id);
        setShowForm(true);
        document.body.style.overflow = 'hidden';
    };

    // Handle delete address
    const handleDelete = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        // Optimistic remove, then sync with the server
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        try {
            await fetch(`/api/account/addresses?key=${encodeURIComponent(addressId)}`, {
                method: 'DELETE',
            });
        } catch {
            loadAddresses(); // revert on failure
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                street: formData.street,
                apartment: formData.apartment,
                city: formData.city,
                country: formData.country,
                postalCode: formData.postalCode,
                phone: formData.phone,
                isDefault: !!formData.isDefault,
            };

            const res = await fetch('/api/account/addresses', {
                method: editingAddress ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingAddress ? { ...payload, _key: editingAddress } : payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to save address');
            }

            // Reload from server so the list stays in sync
            await loadAddresses();
            toggleForm();
            setIsSubmitting(false);
        } catch (error) {
            console.error('Failed to save address:', error);
            setIsSubmitting(false);
        }
    };

    // Lock body scroll when mobile drawer is open
    useEffect(() => {
        if (isMobileDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else if (!showForm) {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileDrawerOpen, showForm]);

    // Close drawer on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (showForm) {
                    toggleForm();
                }
                if (isMobileDrawerOpen) {
                    setIsMobileDrawerOpen(false);
                }
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showForm, isMobileDrawerOpen]);

    return (
        <AuthGuard>
        <div className="min-h-screen flex flex-col">
            {/* Global Styles */}
            <style jsx global>{`
                body {
                    background-color: #fcf9f8;
                    color: #1c1b1b;
                    -webkit-font-smoothing: antialiased;
                }
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
                }
                .premium-border {
                    border-color: rgba(119, 90, 25, 0.15);
                }
                .drawer-overlay {
                    background-color: rgba(0, 37, 30, 0.3);
                    backdrop-filter: blur(4px);
                }
                .address-card:hover .action-buttons {
                    opacity: 1;
                    transform: translateY(0);
                }
                .address-card {
                    transition: transform 0.3s ease;
                }
                .address-card:hover {
                    transform: translateY(-4px);
                }
                @media (min-width: 768px) {
                    .drawer-overlay {
                        display: none;
                    }
                }
            `}</style>

            <Navbar />

            {/* Mobile Drawer Toggle Button */}
            <div className="md:hidden px-margin-mobile pt-4">
                <button
                    onClick={() => setIsMobileDrawerOpen(true)}
                    className="flex items-center gap-3 text-primary hover:text-secondary transition-colors"
                >
                    <span className="material-symbols-outlined text-[24px]">menu</span>
                    <span className="font-label-md text-label-md uppercase tracking-widest">
                        Account Menu
                    </span>
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            {isMobileDrawerOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden drawer-overlay transition-opacity duration-300"
                    onClick={() => setIsMobileDrawerOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-[300px] max-w-[80vw] bg-surface shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
                    isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-secondary/10">
                    <h2 className="font-headline-sm text-headline-sm text-primary">
                        My Account
                    </h2>
                    <button
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className="p-2 hover:bg-surface-container rounded-full transition-colors"
                        aria-label="Close menu"
                    >
                        <span className="material-symbols-outlined text-on-surface-variant">
                            close
                        </span>
                    </button>
                </div>
                <div className="overflow-y-auto h-full pb-20">
                    <Sidebar
                        userData={{
                            name: customer?.name || customer?.firstName || 'Guest',
                            fullName: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Guest User',
                            email: customer?.email || 'guest@example.com',
                        }}
                        activeNav="address"
                        setActiveNav={(id) => {
                            setIsMobileDrawerOpen(false);
                            router.push(`/${id}`);
                        }}
                        navItems={navItems}
                        isMobile={true}
                    />
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg w-full">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                    {/* Desktop Sidebar */}
                    <div className="hidden md:block md:col-span-3">
                        <Sidebar
                            userData={{
                                name: customer?.name || customer?.firstName || 'Guest',
                                fullName: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Guest User',
                                email: customer?.email || 'guest@example.com',
                            }}
                            activeNav="address"
                            setActiveNav={(id) => router.push(`/${id}`)}
                            navItems={navItems}
                            isMobile={false}
                        />
                    </div>

                    {/* Address Book Body */}
                    <div className="md:col-span-9">
                        <div className="max-w-4xl">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-stack-sm gap-4">
                                <div>
                                    <h1 className="font-headline-sm text-headline-md text-primary mb-1">
                                        Address Book
                                    </h1>
                                    <p className="font-body-md text-on-surface-variant">
                                        Manage your saved delivery and billing locations.
                                    </p>
                                </div>
                                <button
                                    onClick={toggleForm}
                                    className="group flex items-center gap-2 bg-primary text-on-primary px-6 py-3 border border-secondary transition-all duration-300 hover:scale-105"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                    <span className="font-label-md text-label-md uppercase tracking-widest">
                                        Add New Address
                                    </span>
                                </button>
                            </div>

                            {/* Address Grid */}
                            {addresses.length === 0 ? (
                                <div className="text-center py-16">
                                    <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">
                                        location_off
                                    </span>
                                    <p className="font-body-lg text-on-surface-variant mb-2">
                                        No addresses saved yet
                                    </p>
                                    <p className="text-label-sm text-on-surface-variant/60">
                                        Add your first address for faster checkout
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-stack-lg">
                                    {addresses.map((address) => (
                                        <div
                                            key={address.id}
                                            className="address-card relative group p-stack-sm bg-white border border-secondary/20 transition-all duration-300 hover:border-secondary/60"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`font-label-sm text-label-sm px-3 py-1 uppercase tracking-tighter ${address.typeColor}`}>
                                                    {address.type}
                                                </span>
                                            </div>
                                            <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
                                                {address.name}
                                            </h3>
                                            <div className="space-y-1 font-body-md text-on-surface-variant leading-relaxed">
                                                <p>{address.street}</p>
                                                <p>{address.city}</p>
                                                <p>{address.province}</p>
                                                <p>{address.country}</p>
                                                <p className="mt-4 flex items-center gap-2 text-primary">
                                                    <span className="material-symbols-outlined text-[18px]">call</span>
                                                    {address.phone}
                                                </p>
                                            </div>
                                            <div className="action-buttons md:opacity-0 md:translate-y-2 flex gap-4 mt-8 transition-all duration-300">
                                                <button
                                                    onClick={() => handleEdit(address)}
                                                    className="flex items-center gap-1 text-label-md text-primary hover:text-secondary transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(address.id)}
                                                    className="flex items-center gap-1 text-label-md text-error hover:opacity-80 transition-opacity"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Add/Edit Address Form Modal */}
            {showForm && (
                <div
                    className="fixed inset-0 z-[60] bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            toggleForm();
                        }
                    }}
                >
                    <div className="bg-surface w-full max-w-2xl p-6 md:p-margin-desktop shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="font-headline-md text-headline-md text-primary">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h2>
                            <button
                                onClick={toggleForm}
                                className="material-symbols-outlined text-primary hover:rotate-90 transition-transform p-2"
                            >
                                close
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label
                                        className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"
                                        htmlFor="firstName"
                                    >
                                        First Name
                                    </label>
                                    <input
                                        className="w-full bg-white border-b border-secondary/30 focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-primary placeholder:text-outline-variant"
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        placeholder="e.g. Zahra"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label
                                        className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"
                                        htmlFor="lastName"
                                    >
                                        Last Name
                                    </label>
                                    <input
                                        className="w-full bg-white border-b border-secondary/30 focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-primary placeholder:text-outline-variant"
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        placeholder="e.g. Mansoor"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Street Address */}
                            <div className="space-y-1">
                                <label
                                    className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"
                                    htmlFor="street"
                                >
                                    Street Address
                                </label>
                                <input
                                    className="w-full bg-white border-b border-secondary/30 focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-primary placeholder:text-outline-variant"
                                    id="street"
                                    name="street"
                                    type="text"
                                    placeholder="House number and street name"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Apartment */}
                            <div className="space-y-1">
                                <label
                                    className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"
                                    htmlFor="apartment"
                                >
                                    Apartment, suite, unit, etc. (optional)
                                </label>
                                <input
                                    className="w-full bg-white border-b border-secondary/30 focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-primary"
                                    id="apartment"
                                    name="apartment"
                                    type="text"
                                    value={formData.apartment}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* City & Country */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label
                                        className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"
                                        htmlFor="city"
                                    >
                                        City
                                    </label>
                                    <input
                                        className="w-full bg-white border-b border-secondary/30 focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-primary"
                                        id="city"
                                        name="city"
                                        type="text"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label
                                        className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"
                                        htmlFor="country"
                                    >
                                        Country / Region
                                    </label>
                                    <select
                                        className="w-full bg-white border-b border-secondary/30 focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-primary appearance-none"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                    >
                                        {countries.map((country) => (
                                            <option key={country} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Postal Code & Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label
                                        className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"
                                        htmlFor="postalCode"
                                    >
                                        Postal Code
                                    </label>
                                    <input
                                        className="w-full bg-white border-b border-secondary/30 focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-primary"
                                        id="postalCode"
                                        name="postalCode"
                                        type="text"
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label
                                        className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"
                                        htmlFor="phone"
                                    >
                                        Phone Number
                                    </label>
                                    <input
                                        className="w-full bg-white border-b border-secondary/30 focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-primary"
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+92 ..."
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Default Address Checkbox */}
                            <div className="flex items-center gap-3 pt-4">
                                <input
                                    className="w-4 h-4 text-primary border-secondary focus:ring-secondary rounded-none"
                                    id="isDefault"
                                    name="isDefault"
                                    type="checkbox"
                                    checked={formData.isDefault}
                                    onChange={handleInputChange}
                                />
                                <label
                                    className="font-body-md text-on-surface-variant"
                                    htmlFor="isDefault"
                                >
                                    Set as default shipping address
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-8">
                                <button
                                    className="flex-1 bg-primary text-on-primary py-4 font-label-md text-label-md uppercase tracking-widest hover:scale-[1.01] transition-transform disabled:opacity-70 disabled:cursor-not-allowed border border-secondary"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                                </button>
                                <button
                                    className="px-8 py-4 border border-outline text-on-surface-variant font-label-md text-label-md uppercase tracking-widest hover:bg-surface-container transition-colors"
                                    type="button"
                                    onClick={toggleForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="w-full bg-surface-container-high border-t premium-border">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md flex flex-col md:flex-row justify-between items-center gap-gutter">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <span className="font-display-lg text-headline-sm text-primary">
                            LUXE EASTERN
                        </span>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                            © 2024 Luxe Eastern. All Rights Reserved.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-stack-sm">
                        <Link href="/sustainability" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all">
                            Sustainability
                        </Link> 
                        <Link href="/shipping" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all">
                            Shipping &amp; Returns
                        </Link> 
                        <Link href="/privacy" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all">
                            Privacy Policy
                        </Link> 
                        <Link href="/contact" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all">
                            Contact Us
                        </Link> 
                        <Link href="/stores" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all">
                            Store Locator
                        </Link> 
                    </div>
                </div>
            </footer>
        </div>
        </AuthGuard>
    );
}