'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../store/authContext';

export function AuthGuard({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined animate-spin text-secondary text-5xl">
                        progress_activity
                    </span>
                    <p className="font-body-md text-on-surface-variant">Loading your account…</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Redirect happens in useEffect
    }

    return <>{children}</>;
}