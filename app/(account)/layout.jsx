'use client';

import Navbar from '@/app/_components/Navbar';
import Footer from '@/app/_components/Footer';
import Sidebar from '@/app/_components/Sidebar';
import { useAuth } from '@/app/store/authContext';
import { accountNavItems } from '@/app/_components/accountNav';
import { AuthGuard } from '@/app/_components/AuthGuard';
import { useState } from 'react';

/**
 * Layout for the customer (account) area.
 *
 * Every page here gets the site Navbar, a reusable Sidebar (desktop rail +
 * mobile drawer) and the global Footer. Authentication is enforced by
 * AuthGuard so individual pages don't need to repeat it. Login and register
 * intentionally live in the separate (auth) group without this chrome.
 */
export default function AccountLayout({ children }) {
    const { customer } = useAuth();
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    const userData = {
        name: customer?.name || customer?.firstName || 'Guest',
        fullName: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Guest User',
        email: customer?.email || 'guest@example.com',
    };

    return (
        <AuthGuard>
            <div className="min-h-screen flex flex-col">
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
                        <Sidebar userData={userData} navItems={accountNavItems} isMobile={true} />
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg w-full">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                        {/* Desktop Sidebar */}
                        <div className="hidden md:block md:col-span-3">
                            <Sidebar userData={userData} navItems={accountNavItems} isMobile={false} />
                        </div>

                        {/* Page Body */}
                        <div className="md:col-span-9 space-y-stack-md">{children}</div>
                    </div>
                </main>

                <Footer />
            </div>
        </AuthGuard>
    );
}
