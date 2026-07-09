'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '../../_components/Navbar';
import Sidebar from '../../_components/Dashboard/Sidebar';
import Link from 'next/link';

// Sample user data
const userData = {
    name: 'Nazish',
    fullName: 'Nazish Ahmed',
    email: 'nazish@example.com',
};

// Sample orders data
const recentOrders = [
    {
        id: '#LX-90234',
        date: 'October 12, 2023',
        status: 'Processing',
        total: '$1,240.00',
        statusColor: 'bg-primary-fixed text-on-primary-fixed-variant',
    },
    {
        id: '#LX-88120',
        date: 'September 24, 2023',
        status: 'Delivered',
        total: '$850.00',
        statusColor: 'bg-surface-container-highest text-on-surface',
    },
];

// Sample address data
const defaultAddress = {
    name: 'Nazish Ahmed',
    street: '124 Silk Road Court',
    district: 'Artisans District, Lahore',
    province: 'Punjab, 54000',
    country: 'Pakistan',
    phone: '+92 300 1234567',
};

// Navigation items
const navItems = [
    { id: 'dashboard', icon: 'grid_view', label: 'Dashboard', active: true },
    { id: 'profile', icon: 'person', label: 'Profile', active: true },
    { id: 'orders', icon: 'package_2', label: 'Orders', active: false },
    { id: 'address', icon: 'menu_book', label: 'Address Book', active: false },
    { id: 'account', icon: 'manage_accounts', label: 'Account Details', active: false },
];

export default function MyAccountPage() {
    const [isNavScrolled, setIsNavScrolled] = useState(false);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const navRef = useRef(null);

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsNavScrolled(true);
            } else {
                setIsNavScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    // Handle button press animation
    const handleMouseDown = (e) => {
        e.currentTarget.classList.add('scale-95');
    };

    const handleMouseUpOrLeave = (e) => {
        e.currentTarget.classList.remove('scale-95');
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
                .nav-link-active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background-color: #775a19;
                    transform-origin: center;
                }
                .drawer-overlay {
                    background-color: rgba(0, 37, 30, 0.3);
                    backdrop-filter: blur(4px);
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
                            navItems={navItems}
                            isMobile={false}
                        />
                    </div>

                    {/* Dashboard Body */}
                    <div className="md:col-span-9 space-y-stack-md">
                        {/* Recent Orders Section */}
                        <section>
                            <div className="flex justify-between items-end mb-stack-sm border-b premium-border pb-4">
                                <h2 className="font-headline-md text-headline-sm text-primary">
                                    Recent Orders
                                </h2>
                                <Link
                                    href="/orders"
                                    className="font-label-sm text-label-sm text-secondary underline hover:text-primary transition-colors"
                                >
                                    View All Orders
                                </Link>
                            </div>
                            <div className="overflow-hidden border premium-border bg-white">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="bg-surface-container-low border-b premium-border">
                                                <th className="p-4 font-label-md text-label-md text-primary uppercase tracking-tighter">
                                                    Order #
                                                </th>
                                                <th className="p-4 font-label-md text-label-md text-primary uppercase tracking-tighter">
                                                    Date
                                                </th>
                                                <th className="p-4 font-label-md text-label-md text-primary uppercase tracking-tighter">
                                                    Status
                                                </th>
                                                <th className="p-4 font-label-md text-label-md text-primary uppercase tracking-tighter">
                                                    Total
                                                </th>
                                                <th className="p-4 font-label-md text-label-md text-primary uppercase tracking-tighter text-right">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-body-md text-body-md divide-y premium-border">
                                            {recentOrders.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className="hover:bg-surface-container-lowest transition-colors"
                                                >
                                                    <td className="p-4 text-primary font-medium">
                                                        {order.id}
                                                    </td>
                                                    <td className="p-4 text-on-surface-variant">
                                                        {order.date}
                                                    </td>
                                                    <td className="p-4">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-label-sm ${order.statusColor}`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-primary font-display-lg text-body-lg">
                                                        {order.total}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button className="font-label-sm text-label-sm text-secondary hover:text-primary font-bold">
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* Profile Overview / Address Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                            {/* Default Address Card */}
                            <div className="p-stack-sm border premium-border bg-white flex flex-col h-full hover:scale-[1.01] transition-transform duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-headline-sm text-headline-sm text-primary">
                                        Default Address
                                    </h3>
                                    <span className="material-symbols-outlined text-secondary">
                                        location_on
                                    </span>
                                </div>
                                <div className="flex-grow font-body-md text-body-md text-on-surface-variant leading-relaxed">
                                    <p className="font-bold text-primary mb-1">
                                        {defaultAddress.name}
                                    </p>
                                    <p>{defaultAddress.street}</p>
                                    <p>{defaultAddress.district}</p>
                                    <p>{defaultAddress.province}</p>
                                    <p>{defaultAddress.country}</p>
                                    <p className="mt-4 text-label-sm">{defaultAddress.phone}</p>
                                </div>
                                <button className="mt-stack-sm w-full py-3 border border-secondary text-secondary font-label-md uppercase tracking-widest hover:bg-secondary hover:text-white transition-all duration-300">
                                    Edit Address
                                </button>
                            </div>

                            {/* Account Summary Card */}
                            <div className="p-stack-sm border premium-border bg-white flex flex-col h-full hover:scale-[1.01] transition-transform duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-headline-sm text-headline-sm text-primary">
                                        Account Summary
                                    </h3>
                                    <span className="material-symbols-outlined text-secondary">
                                        account_circle
                                    </span>
                                </div>
                                <div className="flex-grow font-body-md text-body-md text-on-surface-variant leading-relaxed space-y-3">
                                    <div>
                                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                                            Name
                                        </p>
                                        <p className="font-medium text-primary">{userData.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                                            Email
                                        </p>
                                        <p className="font-medium text-primary">{userData.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                                            Member Since
                                        </p>
                                        <p className="font-medium text-primary">January 2023</p>
                                    </div>
                                    <div>
                                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                                            Total Orders
                                        </p>
                                        <p className="font-medium text-primary">12</p>
                                    </div>
                                </div>
                                <button className="mt-stack-sm w-full py-3 border border-secondary text-secondary font-label-md uppercase tracking-widest hover:bg-secondary hover:text-white transition-all duration-300">
                                    Edit Profile
                                </button>
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
                        <Link
                            href="/sustainability"
                            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all"
                        >
                            Sustainability
                        </Link>
                        <Link
                            href="/shipping"
                            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all"
                        >
                            Shipping &amp; Returns
                        </Link>
                        <Link
                            href="/privacy"
                            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all"
                        >
                            Privacy Policy
                        </Link>
                        <Link  
                            href="/contact"
                            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all"
                        >
                            Contact Us
                        </Link>
                        <Link
                            href="/stores"
                            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all"
                        >
                            Store Locator
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}