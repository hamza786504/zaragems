'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../store/authContext';

export default function MyAccountPage() {
    const { customer, loading, isAuthenticated, refresh } = useAuth();
    const [recentOrders, setRecentOrders] = useState([]);
    const [defaultAddress, setDefaultAddress] = useState(null);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [addressLoading, setAddressLoading] = useState(true);
    const [ordersError, setOrdersError] = useState(null);
    const [addressError, setAddressError] = useState(null);

    // Fetch orders when authenticated
    useEffect(() => {
        if (isAuthenticated && customer) {
            setOrdersLoading(true);
            fetch('/api/account/orders')
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.orders) {
                        setRecentOrders(data.orders.slice(0, 5).map((order) => ({
                            id: order.orderId,
                            _id: order._id,
                            date: new Date(order.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            }),
                            status: order.fulfillmentStatus || order.status || 'Processing',
                            total: `Rs. ${Number(order.total).toLocaleString()}`,
                            statusColor: (() => {
                                const s = order.fulfillmentStatus || order.status;
                                return s === 'Fulfilled' || s === 'Delivered'
                                    ? 'bg-surface-container-highest text-on-surface'
                                    : 'bg-primary-fixed text-on-primary-fixed-variant';
                            })(),
                        })));
                    } else if (!data.success) {
                        setOrdersError(data.error || 'Failed to load orders');
                    }
                })
                .catch(() => setOrdersError('Failed to load orders'))
                .finally(() => setOrdersLoading(false));
        }
    }, [isAuthenticated, customer]);

    // Fetch addresses when authenticated
    useEffect(() => {
        if (isAuthenticated && customer) {
            setAddressLoading(true);
            fetch('/api/account/addresses')
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.addresses && data.addresses.length > 0) {
                        const defaultAddr = data.addresses.find((a) => a.isDefault) || data.addresses[0];
                        setDefaultAddress({
                            name: `${defaultAddr.firstName} ${defaultAddr.lastName}`.trim(),
                            street: defaultAddr.street,
                            district: defaultAddr.city,
                            province: `${defaultAddr.postalCode || ''} ${defaultAddr.country || ''}`.trim(),
                            country: defaultAddr.country || 'Pakistan',
                            phone: defaultAddr.phone,
                        });
                    } else {
                        // No saved addresses — show the empty state, not mock data.
                        setDefaultAddress(null);
                    }
                })
                .catch(() => {
                    setAddressError('Failed to load addresses');
                    setDefaultAddress(null);
                })
                .finally(() => setAddressLoading(false));
        }
    }, [isAuthenticated, customer]);

    return (
        <>
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
                {loading || ordersLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <span className="material-symbols-outlined animate-spin text-secondary text-4xl">
                            progress_activity
                        </span>
                    </div>
                ) : !isAuthenticated ? (
                    <div className="bg-surface-container-low border premium-border p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 block">
                            account_circle
                        </span>
                        <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
                            Please sign in to view your orders
                        </h3>
                        <p className="text-on-surface-variant mb-6">
                            Your order history will appear here once you're logged in.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 font-label-md text-label-md uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all border border-secondary/20"
                        >
                            Sign In
                        </Link>
                    </div>
                ) : ordersError ? (
                    <div className="bg-error-container/20 border border-error/30 p-4 text-error text-center">
                        {ordersError}
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="bg-surface-container-low border premium-border p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 block">
                            shopping_bag
                        </span>
                        <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
                            No orders yet
                        </h3>
                        <p className="text-on-surface-variant mb-6">
                            Your order history will appear here once you place an order.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 font-label-md text-label-md uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all border border-secondary/20"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
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
                )}
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
                    {!isAuthenticated ? (
                        <div className="flex-grow flex flex-col items-center justify-center text-center">
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">
                                location_off
                            </span>
                            <p className="text-on-surface-variant mb-4">
                                Sign in to view your saved addresses
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 font-label-md text-label-md uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all border border-secondary/20"
                            >
                                Sign In
                            </Link>
                        </div>
                    ) : addressError ? (
                        <div className="bg-error-container/20 border border-error/30 p-4 text-error text-center">
                            {addressError}
                        </div>
                    ) : addressLoading ? (
                        <div className="flex-grow flex items-center justify-center py-8">
                                <span className="material-symbols-outlined animate-spin text-secondary text-3xl">
                                    progress_activity
                                </span>
                        </div>
                    ) : defaultAddress ? (
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
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center py-6">
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">
                                location_off
                            </span>
                            <p className="text-on-surface-variant mb-4">
                                No saved address yet.
                            </p>
                            <Link
                                href="/address"
                                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 font-label-md text-label-md uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all border border-secondary/20"
                            >
                                Add Address
                            </Link>
                        </div>
                    )}
                    {!isAuthenticated ? null : (
                        <button className="mt-stack-sm w-full py-3 border border-secondary text-secondary font-label-md uppercase tracking-widest hover:bg-secondary hover:text-white transition-all duration-300">
                            Edit Address
                        </button>
                    )}
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
                    {!isAuthenticated ? (
                        <div className="flex-grow flex flex-col items-center justify-center text-center">
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">
                                account_circle
                            </span>
                            <p className="text-on-surface-variant mb-4">
                                Sign in to view your account details
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 font-label-md text-label-md uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all border border-secondary/20"
                            >
                                Sign In
                            </Link>
                        </div>
                    ) : (
                        <div className="flex-grow font-body-md text-body-md text-on-surface-variant leading-relaxed space-y-3">
                            <div>
                                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                                    Name
                                </p>
                                <p className="font-medium text-primary">{customer?.name || 'Guest User'}</p>
                            </div>
                            <div>
                                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                                    Email
                                </p>
                                <p className="font-medium text-primary">{customer?.email || 'guest@example.com'}</p>
                            </div>
                            <div>
                                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                                    Member Since
                                </p>
                                <p className="font-medium text-primary">
                                    {customer?.createdAt
                                        ? new Date(customer.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                        })
                                        : 'January 2023'}
                                </p>
                            </div>
                            <div>
                                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                                    Total Orders
                                </p>
                                <p className="font-medium text-primary">
                                    {customer?.ordersCount || recentOrders.length}
                                </p>
                            </div>
                        </div>
                    )}
                    {!isAuthenticated ? null : (
                        <button className="mt-stack-sm w-full py-3 border border-secondary text-secondary font-label-md uppercase tracking-widest hover:bg-secondary hover:text-white transition-all duration-300">
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
