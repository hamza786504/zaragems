'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Storefront customer auth. The session itself lives in an httpOnly
// `customer_token` cookie set by the API; this context just exposes the
// current customer object and helpers for the client UI.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setCustomer(data.success ? data.customer : null);
            } else {
                setCustomer(null);
            }
        } catch {
            setCustomer(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const login = useCallback(async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Login failed');
        setCustomer(data.customer);
        return data.customer;
    }, []);

    const register = useCallback(async (payload) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Registration failed');
        setCustomer(data.customer);
        return data.customer;
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } finally {
            setCustomer(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ customer, loading, isAuthenticated: !!customer, login, register, logout, refresh, setCustomer }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (ctx === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}
