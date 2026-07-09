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

// Extended sample orders data
const allOrders = [
    { id: '#LX-90234', date: 'October 12, 2023', status: 'Processing', total: '$1,240.00', statusColor: 'bg-primary-fixed text-on-primary-fixed-variant', items: 3 },
    { id: '#LX-88120', date: 'September 24, 2023', status: 'Delivered', total: '$850.00', statusColor: 'bg-surface-container-highest text-on-surface', items: 2 },
    { id: '#LX-90345', date: 'November 5, 2023', status: 'Shipped', total: '$2,100.00', statusColor: 'bg-secondary-fixed text-on-secondary-fixed', items: 5 },
    { id: '#LX-90456', date: 'November 15, 2023', status: 'Processing', total: '$560.00', statusColor: 'bg-primary-fixed text-on-primary-fixed-variant', items: 1 },
    { id: '#LX-90567', date: 'December 1, 2023', status: 'Delivered', total: '$1,890.00', statusColor: 'bg-surface-container-highest text-on-surface', items: 4 },
    { id: '#LX-90678', date: 'December 10, 2023', status: 'Cancelled', total: '$320.00', statusColor: 'bg-error-container text-on-error-container', items: 1 },
    { id: '#LX-90789', date: 'January 5, 2024', status: 'Delivered', total: '$3,450.00', statusColor: 'bg-surface-container-highest text-on-surface', items: 6 },
    { id: '#LX-90890', date: 'January 20, 2024', status: 'Processing', total: '$1,670.00', statusColor: 'bg-primary-fixed text-on-primary-fixed-variant', items: 3 },
    { id: '#LX-90901', date: 'February 3, 2024', status: 'Shipped', total: '$980.00', statusColor: 'bg-secondary-fixed text-on-secondary-fixed', items: 2 },
    { id: '#LX-91012', date: 'February 15, 2024', status: 'Delivered', total: '$4,200.00', statusColor: 'bg-surface-container-highest text-on-surface', items: 8 },
    { id: '#LX-91123', date: 'March 1, 2024', status: 'Processing', total: '$750.00', statusColor: 'bg-primary-fixed text-on-primary-fixed-variant', items: 1 },
    { id: '#LX-91234', date: 'March 10, 2024', status: 'Shipped', total: '$2,340.00', statusColor: 'bg-secondary-fixed text-on-secondary-fixed', items: 4 },
];

// Navigation items
const navItems = [
    { id: 'dashboard', icon: 'grid_view', label: 'Dashboard', active: true },
    { id: 'profile', icon: 'person', label: 'Profile', active: true },
    { id: 'orders', icon: 'package_2', label: 'Orders', active: false },
    { id: 'address', icon: 'menu_book', label: 'Address Book', active: false },
    { id: 'account', icon: 'manage_accounts', label: 'Account Details', active: false },
];

const ITEMS_PER_PAGE = 5;

export default function Orders() {
    const [activeNav, setActiveNav] = useState('orders');
    const [isNavScrolled, setIsNavScrolled] = useState(false);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const navRef = useRef(null);

    // Calculate pagination
    const totalPages = Math.ceil(allOrders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentOrders = allOrders.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to top of table
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

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
                        activeNav={activeNav}
                        setActiveNav={(id) => {
                            setActiveNav(id);
                            setIsMobileDrawerOpen(false);
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
                            activeNav={activeNav}
                            setActiveNav={setActiveNav}
                            navItems={navItems}
                            isMobile={false}
                        />
                    </div>

                    {/* Orders Body */}
                    <div className="md:col-span-9 space-y-stack-md">
                        <section>
                            <div className="flex justify-between items-end mb-stack-sm border-b premium-border pb-4">
                                <div>
                                    <h2 className="font-headline-md text-headline-sm text-primary">
                                        All Orders
                                    </h2>
                                    <p className="text-label-sm text-on-surface-variant mt-1">
                                        Showing {startIndex + 1}-{Math.min(endIndex, allOrders.length)} of {allOrders.length} orders
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Items per page selector */}
                                    <select 
                                        className="bg-surface-container-low border border-secondary/20 px-3 py-2 text-label-sm focus:border-secondary focus:ring-0"
                                        value={ITEMS_PER_PAGE}
                                        onChange={(e) => {
                                            setCurrentPage(1);
                                            // You can make this dynamic if needed
                                        }}
                                    >
                                        <option value="5">5 per page</option>
                                        <option value="10">10 per page</option>
                                        <option value="20">20 per page</option>
                                    </select>
                                </div>
                            </div>

                            {/* Orders Table */}
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
                                            {currentOrders.map((order) => (
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

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                                <div className="text-label-sm text-on-surface-variant">
                                    Page {currentPage} of {totalPages}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {/* Previous Button */}
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentPage === 1}
                                        className={`flex items-center gap-1 px-3 py-2 border transition-all duration-200 ${
                                            currentPage === 1
                                                ? 'border-outline-variant text-on-surface-variant/40 cursor-not-allowed'
                                                : 'border-secondary text-secondary hover:bg-secondary hover:text-white'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                        <span className="hidden sm:inline text-label-sm font-label-sm">Previous</span>
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {getPageNumbers().map((page, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    if (typeof page === 'number') {
                                                        handlePageChange(page);
                                                    }
                                                }}
                                                disabled={page === '...'}
                                                className={`w-10 h-10 flex items-center justify-center text-label-sm font-label-sm transition-all duration-200 ${
                                                    page === currentPage
                                                        ? 'bg-primary text-on-primary'
                                                        : page === '...'
                                                        ? 'text-on-surface-variant cursor-default'
                                                        : 'text-on-surface-variant hover:bg-surface-container-low'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        onClick={handleNext}
                                        disabled={currentPage === totalPages}
                                        className={`flex items-center gap-1 px-3 py-2 border transition-all duration-200 ${
                                            currentPage === totalPages
                                                ? 'border-outline-variant text-on-surface-variant/40 cursor-not-allowed'
                                                : 'border-secondary text-secondary hover:bg-secondary hover:text-white'
                                        }`}
                                    >
                                        <span className="hidden sm:inline text-label-sm font-label-sm">Next</span>
                                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </section>
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