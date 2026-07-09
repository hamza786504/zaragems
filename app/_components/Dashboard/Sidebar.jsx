'use client';

import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';

function Sidebar({ userData, navItems, isMobile }) {
    const pathname = usePathname();
    
    // Extract the last segment of the path
    // e.g., /dashboard -> dashboard, /account/orders -> orders
    const activeNav = pathname.split('/').pop() || 'dashboard';

    return (
        <aside className={`${isMobile ? 'p-4' : 'space-y-stack-sm'}`}>
            {!isMobile && (
                <div className="mb-stack-md">
                    <h1 className="font-display-lg text-headline-sm text-primary mb-1">
                        My Account
                    </h1>
                    <p className="font-body-md text-label-sm text-on-surface-variant">
                        Welcome back, {userData.name}
                    </p>
                </div>
            )}
            {isMobile && (
                <div className="mb-6">
                    <p className="font-body-md text-label-sm text-on-surface-variant">
                        Welcome back, <span className="font-bold text-primary">{userData.name}</span>
                    </p>
                </div>
            )}
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <Link 
                        href={`/${item.id}`}
                        key={item.id}
                        className={`flex items-center gap-4 py-3 px-4 transition-all duration-200 group ${
                            activeNav === item.id
                                ? 'bg-primary text-on-primary rounded'
                                : 'text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                    >
                        <span
                            className="material-symbols-outlined text-[20px]"
                            style={{
                                fontVariationSettings: activeNav === item.id ? "'FILL' 1" : "'FILL' 0",
                            }}
                        >
                            {item.icon}
                        </span>
                        <span className="font-label-md text-label-md uppercase tracking-widest">
                            {item.label}
                        </span>
                    </Link>
                ))}
                <div className="pt-4 mt-4 border-t premium-border">
                    <button
                        className="flex items-center gap-4 py-3 px-4 text-error hover:bg-error-container transition-all duration-200 rounded w-full"
                        onClick={() => {
                            // Handle logout
                            console.log('Logging out...');
                        }}
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        <span className="font-label-md text-label-md uppercase tracking-widest">
                            Logout
                        </span>
                    </button>
                </div>
            </nav>
        </aside>
    );
}

export default Sidebar;