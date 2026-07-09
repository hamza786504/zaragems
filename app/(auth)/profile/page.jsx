'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '../../_components/Navbar';
import Sidebar from '../../_components/Dashboard/Sidebar';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Sample user data
const userData = {
    name: 'Nazish',
    fullName: 'Nazish Ahmed',
    email: 'nazish@example.com',
};

// Initial profile data
const initialProfileData = {
    firstName: 'Amara',
    lastName: 'Khan',
    email: 'amara.khan@example.com',
    phone: '+92 300 1234567',
    currentPassword: '',
    newPassword: '',
};

// Navigation items
const navItems = [
    { id: 'dashboard', icon: 'grid_view', label: 'Dashboard' },
    { id: 'orders', icon: 'package_2', label: 'Orders' },
    { id: 'profile', icon: 'person', label: 'Profile' },
    { id: 'address', icon: 'menu_book', label: 'Address Book' },
    { id: 'account', icon: 'manage_accounts', label: 'Account Details' },
];

export default function AccountDetailsPage() {
    const router = useRouter();
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    
    const [formData, setFormData] = useState(initialProfileData);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Success
            setIsSubmitting(false);
            setSubmitStatus('success');
            
            // Reset success message after 2 seconds
            setTimeout(() => {
                setSubmitStatus(null);
            }, 2000);
            
        } catch (error) {
            setIsSubmitting(false);
            setSubmitStatus('error');
            
            // Reset error message after 3 seconds
            setTimeout(() => {
                setSubmitStatus(null);
            }, 3000);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setFormData(initialProfileData);
        router.push('/dashboard');
    };

    // Lock body scroll when mobile drawer is open
    useEffect(() => {
        if (isMobileDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileDrawerOpen]);

    // Close drawer on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isMobileDrawerOpen) {
                setIsMobileDrawerOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isMobileDrawerOpen]);

    // Get submit button text
    const getSubmitButtonText = () => {
        if (isSubmitting) return 'Processing...';
        if (submitStatus === 'success') return 'Changes Saved';
        return 'Save Changes';
    };

    // Get submit button styles
    const getSubmitButtonStyles = () => {
        if (submitStatus === 'success') {
            return 'bg-secondary text-primary border-secondary';
        }
        return 'bg-primary text-on-primary border-secondary hover:scale-105';
    };

    return (
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
                .input-transition {
                    transition: border-color 0.3s ease, background-color 0.3s ease;
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
                        userData={userData}
                        activeNav="account"
                        setActiveNav={(id) => {
                            setIsMobileDrawerOpen(false);
                            router.push(`/${id}`);
                        }}
                        navItems={navItems}
                        isMobile={true}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg w-full">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                    {/* Desktop Sidebar */}
                    <div className="hidden md:block md:col-span-3">
                        <Sidebar
                            userData={userData}
                            activeNav="account"
                            setActiveNav={(id) => router.push(`/${id}`)}
                            navItems={navItems}
                            isMobile={false}
                        />
                    </div>

                    {/* Profile Body */}
                    <div className="md:col-span-9 space-y-stack-md">
                        <div className="max-w-3xl">
                            {/* Header */}
                            <div className="mb-stack-sm border-b premium-border pb-4">
                                <h1 className="font-display-lg text-headline-md text-primary mb-2">
                                    Account Details
                                </h1>
                                <p className="font-body-md text-on-surface-variant">
                                    Update your personal information and security preferences below to maintain your exclusive profile.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-stack-sm">
                                {/* Personal Information Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                                    {/* First Name */}
                                    <div className="flex flex-col gap-2">
                                        <label 
                                            className="font-label-md text-label-md text-primary uppercase tracking-wider" 
                                            htmlFor="first_name"
                                        >
                                            First Name
                                        </label>
                                        <input
                                            className="input-transition bg-surface-container-low border border-secondary/30 focus:border-secondary focus:ring-0 rounded-none px-4 py-3 font-body-md text-on-surface outline-none"
                                            id="first_name"
                                            name="firstName"
                                            type="text"
                                            placeholder="Enter your first name"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div className="flex flex-col gap-2">
                                        <label 
                                            className="font-label-md text-label-md text-primary uppercase tracking-wider" 
                                            htmlFor="last_name"
                                        >
                                            Last Name
                                        </label>
                                        <input
                                            className="input-transition bg-surface-container-low border border-secondary/30 focus:border-secondary focus:ring-0 rounded-none px-4 py-3 font-body-md text-on-surface outline-none"
                                            id="last_name"
                                            name="lastName"
                                            type="text"
                                            placeholder="Enter your last name"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="flex flex-col gap-2">
                                        <label 
                                            className="font-label-md text-label-md text-primary uppercase tracking-wider" 
                                            htmlFor="email"
                                        >
                                            Email Address
                                        </label>
                                        <input
                                            className="input-transition bg-surface-container-low border border-secondary/30 focus:border-secondary focus:ring-0 rounded-none px-4 py-3 font-body-md text-on-surface outline-none"
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="email@address.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="flex flex-col gap-2">
                                        <label 
                                            className="font-label-md text-label-md text-primary uppercase tracking-wider" 
                                            htmlFor="phone"
                                        >
                                            Phone Number
                                        </label>
                                        <input
                                            className="input-transition bg-surface-container-low border border-secondary/30 focus:border-secondary focus:ring-0 rounded-none px-4 py-3 font-body-md text-on-surface outline-none"
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="+92 XXX XXXXXXX"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Password Update Section */}
                                <div className="mt-stack-md pt-stack-sm border-t premium-border">
                                    <h3 className="font-headline-sm text-headline-sm text-primary mb-6">
                                        Password Security
                                    </h3>
                                    <div className="space-y-6">
                                        {/* Current Password */}
                                        <div className="flex flex-col gap-2 max-w-md">
                                            <label 
                                                className="font-label-md text-label-md text-primary uppercase tracking-wider" 
                                                htmlFor="current_password"
                                            >
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    className="w-full input-transition bg-surface-container-low border border-secondary/30 focus:border-secondary focus:ring-0 rounded-none px-4 py-3 font-body-md text-on-surface outline-none pr-12"
                                                    id="current_password"
                                                    name="currentPassword"
                                                    type={showCurrentPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={formData.currentPassword}
                                                    onChange={handleInputChange}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                                                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    <span className="material-symbols-outlined">
                                                        {showCurrentPassword ? 'visibility' : 'visibility_off'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div className="flex flex-col gap-2 max-w-md">
                                            <label 
                                                className="font-label-md text-label-md text-primary uppercase tracking-wider" 
                                                htmlFor="new_password"
                                            >
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    className="w-full input-transition bg-surface-container-low border border-secondary/30 focus:border-secondary focus:ring-0 rounded-none px-4 py-3 font-body-md text-on-surface outline-none pr-12"
                                                    id="new_password"
                                                    name="newPassword"
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    placeholder="Min. 8 characters"
                                                    value={formData.newPassword}
                                                    onChange={handleInputChange}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                                                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    <span className="material-symbols-outlined">
                                                        {showNewPassword ? 'visibility' : 'visibility_off'}
                                                    </span>
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-on-surface-variant/60 font-label-sm italic">
                                                Include at least one uppercase letter and one special character.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {submitStatus === 'error' && (
                                    <div className="flex items-center gap-2 text-error bg-error-container/20 px-4 py-3 border border-error/30">
                                        <span className="material-symbols-outlined text-error">error</span>
                                        <p className="text-label-sm font-label-sm">
                                            Failed to update profile. Please try again.
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-stack-sm flex flex-col sm:flex-row items-center gap-gutter">
                                    <button
                                        className={`w-full sm:w-auto font-label-md text-label-md uppercase tracking-[0.2em] px-12 py-4 border transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${getSubmitButtonStyles()}`}
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {getSubmitButtonText()}
                                    </button>
                                    <button
                                        className="w-full sm:w-auto border border-secondary text-primary font-label-md text-label-md uppercase tracking-[0.2em] px-12 py-4 hover:bg-surface-container-low transition-all duration-300"
                                        type="button"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>

                            {/* Editorial Visual Element */}
                            <div className="mt-stack-lg relative h-64 overflow-hidden">
                                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10" />
                                <Image
                                    className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
                                    alt="A high-end editorial fashion photography shot featuring luxury Eastern textile close-ups"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRdkmZcMKEylPdp2Qria6eZdqlkod7YHFaQtv2hnAVJg85h_gZaX7skmT79LWIZXQlGAmRXi9OsiAaHV-Mu-QQMP73ulxFQ6ez0x_4t5ztsChaJ1RYZc7cE0Uvqve_v0gjZO-k5KoYlfoPMDgmrkh384YgW7O4NLifM1QH11HPpLoHNGMRFCG_Xk_De0bOtVkWPSOwjKC8jbj90AQ2CuArlKy3T-FW8j3I1S1KvyWzySckEPKl2xLuVvr36iyxv-eqFJih8rhhnk05"
                                    width={500}
                                    height={500}
                                />
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <p className="font-display-lg text-headline-sm text-on-primary italic drop-shadow-xl">
                                        Crafting Timeless Heritage
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

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
    );
}