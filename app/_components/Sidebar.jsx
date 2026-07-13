'use client';

import Link from 'next/link';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../store/authContext';

/**
 * Reusable account sidebar.
 *
 * Renders the "My Account" navigation. Used by the (account) layout for both
 * the desktop rail and the mobile drawer — pass `isMobile` to switch variants.
 *
 * Active state is derived from the current pathname (supporting nested routes
 * such as /orders/[id]) unless an explicit `activeNav` is provided.
 */
export default function Sidebar({ userData, navItems, isMobile = false, activeNav }) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const isActive = (id) => {
        if (activeNav) return activeNav === id;
        const href = `/${id}`;
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            // Even if the server call fails, clear local state and leave.
        } finally {
            router.push('/login');
            router.refresh();
        }
    };

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
                {navItems.map((item) => {
                    const active = isActive(item.id);
                    return (
                        <Link
                            href={`/${item.id}`}
                            key={item.id}
                            className={`flex items-center gap-4 py-3 px-4 transition-all duration-200 group ${
                                active
                                    ? 'bg-primary text-on-primary rounded'
                                    : 'text-on-surface-variant hover:bg-surface-container-low'
                            }`}
                        >
                            <span
                                className="material-symbols-outlined text-[20px]"
                                style={{
                                    fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                                }}
                            >
                                {item.icon}
                            </span>
                            <span className="font-label-md text-label-md uppercase tracking-widest">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
                <div className="pt-4 mt-4 border-t premium-border">
                    <button
                        className="flex items-center gap-4 py-3 px-4 text-error hover:bg-error-container transition-all duration-200 rounded w-full"
                        onClick={handleLogout}
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
