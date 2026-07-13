'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../store/authContext';

const STATUS_COLORS = {
    Delivered: 'bg-surface-container-highest text-on-surface',
    Processing: 'bg-primary-fixed text-on-primary-fixed-variant',
    Shipped: 'bg-secondary-fixed text-on-secondary-fixed',
    Cancelled: 'bg-error-container text-on-error-container',
    Pending: 'bg-tertiary-container/20 text-tertiary',
    'Partially Paid': 'bg-surface-container-highest text-on-surface',
    Refunded: 'bg-error-container text-on-error-container',
    Unfulfilled: 'bg-tertiary-container/20 text-tertiary',
    Fulfilled: 'bg-primary-fixed text-on-primary-fixed-variant',
    Returned: 'bg-error-container text-on-error-container',
};

const getStatusColor = (status) =>
    STATUS_COLORS[status] || 'bg-surface-container-highest text-on-surface';

const formatTotal = (value) =>
    `Rs. ${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${formatDate(dateStr)} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
};

export default function OrderDetail() {
    const params = useParams();
    const id = params?.id;
    const { customer, isAuthenticated } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated || !id) return;
        let active = true;
        setLoading(true);
        setError('');

        const load = async () => {
            try {
                const res = await fetch(`/api/orders/${id}`, { cache: 'no-store' });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.message || data.error || 'Failed to load order.');
                }
                // Ownership check: a customer may only view their own order.
                const ownerEmail = (data.order?.customer?.email || data.order?.email || '').toLowerCase();
                if (customer?.email && ownerEmail && ownerEmail !== customer.email.toLowerCase()) {
                    throw new Error('You do not have permission to view this order.');
                }
                if (active) setOrder(data.order);
            } catch (err) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, [isAuthenticated, id, customer?.email]);

    const lineItems = order?.lineItems || [];
    const orderCustomer = order?.customer || {};
    const shippingLines = [
        orderCustomer.name || order?.email,
        order?.address,
        order?.apartment,
        [order?.city, order?.postalCode].filter(Boolean).join(', '),
        order?.country,
    ].filter(Boolean);

    return (
        <div className="space-y-stack-md">
            <div className="flex items-center gap-3 mb-stack-sm">
                <Link
                    href="/orders"
                    className="flex items-center gap-1 text-primary hover:text-secondary transition-colors font-label-sm text-label-sm"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    Back to Orders
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-secondary text-4xl">
                        progress_activity
                    </span>
                </div>
            ) : error || !order ? (
                <div className="bg-error-container/20 border border-error/30 p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-error mb-4 block">
                        error
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
                        Order not found
                    </h3>
                    <p className="text-on-surface-variant mb-6">{error || 'This order does not exist.'}</p>
                    <Link
                        href="/orders"
                        className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 font-label-md text-label-md uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all border border-secondary/20"
                    >
                        View All Orders
                    </Link>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <section className="border-b premium-border pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h2 className="font-display-lg text-headline-md text-primary">
                                    Order {order.orderId}
                                </h2>
                                <p className="text-label-sm text-on-surface-variant mt-1">
                                    Placed {formatDateTime(order.date || order.createdAt)} ·{' '}
                                    {order.channel || 'Online Store'}
                                </p>
                            </div>
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-label-sm font-label-sm ${getStatusColor(
                                    order.fulfillmentStatus || order.status
                                )}`}
                            >
                                {order.fulfillmentStatus || order.status || 'Processing'}
                            </span>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                        {/* Left: Items */}
                        <div className="lg:col-span-8 space-y-stack-sm">
                            <div className="border premium-border bg-white overflow-hidden">
                                <div className="p-4 border-b premium-border bg-surface-container-low">
                                    <h3 className="font-headline-sm text-headline-sm text-primary">
                                        Order items
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[500px]">
                                        <thead>
                                            <tr className="bg-surface-container-lowest border-b premium-border">
                                                <th className="p-4 font-label-sm text-label-sm text-primary uppercase tracking-tighter">
                                                    Product
                                                </th>
                                                <th className="p-4 font-label-sm text-label-sm text-primary uppercase tracking-tighter">
                                                    Price
                                                </th>
                                                <th className="p-4 font-label-sm text-label-sm text-primary uppercase tracking-tighter">
                                                    Qty
                                                </th>
                                                <th className="p-4 text-right font-label-sm text-label-sm text-primary uppercase tracking-tighter">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-body-md text-body-md divide-y premium-border">
                                            {lineItems.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-4 text-on-surface-variant">
                                                        No items recorded for this order.
                                                    </td>
                                                </tr>
                                            )}
                                            {lineItems.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                                                    <td className="p-4">
                                                        <p className="font-medium text-primary">{item.title}</p>
                                                        {(item.size || item.color) && (
                                                            <p className="text-label-sm text-on-surface-variant">
                                                                {[
                                                                    item.size && `Size: ${item.size}`,
                                                                    item.color && `Color: ${item.color}`,
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(', ')}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-on-surface-variant">
                                                        {formatTotal(item.price)}
                                                    </td>
                                                    <td className="p-4 text-on-surface-variant">{item.quantity}</td>
                                                    <td className="p-4 text-right font-medium text-primary">
                                                        {formatTotal(
                                                            Number(item.price || 0) * Number(item.quantity || 0)
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="border premium-border bg-white p-stack-sm">
                                <h3 className="font-headline-sm text-headline-sm text-primary mb-4">
                                    Order status
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                        <div>
                                            <p className="font-medium text-primary">Order placed</p>
                                            <p className="text-label-sm text-on-surface-variant">
                                                {formatDateTime(order.date || order.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span
                                            className={`material-symbols-outlined ${
                                                order.paymentStatus === 'Paid' || order.paymentStatus === 'Partially Paid'
                                                    ? 'text-primary'
                                                    : 'text-on-surface-variant'
                                            }`}
                                        >
                                            {order.paymentStatus === 'Paid' ? 'check_circle' : 'schedule'}
                                        </span>
                                        <div>
                                            <p className="font-medium text-primary">
                                                Payment {order.paymentStatus === 'Paid' ? 'received' : 'pending'}
                                            </p>
                                            <p className="text-label-sm text-on-surface-variant">
                                                {order.paymentMethod === 'bank' ? 'Bank Deposit' : 'Cash on Delivery'} ·{' '}
                                                {order.paymentStatus || 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span
                                            className={`material-symbols-outlined ${
                                                order.fulfillmentStatus === 'Fulfilled' ? 'text-primary' : 'text-on-surface-variant'
                                            }`}
                                        >
                                            {order.fulfillmentStatus === 'Fulfilled' ? 'check_circle' : 'local_shipping'}
                                        </span>
                                        <div>
                                            <p className="font-medium text-primary">
                                                {order.fulfillmentStatus === 'Fulfilled' ? 'Fulfilled' : 'Pending fulfillment'}
                                            </p>
                                            <p className="text-label-sm text-on-surface-variant">
                                                {order.shippingMethod || 'Standard Shipping'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Summary cards */}
                        <div className="lg:col-span-4 space-y-stack-sm">
                            {/* Payment Summary */}
                            <div className="border premium-border bg-white p-stack-sm">
                                <h3 className="font-headline-sm text-headline-sm text-primary mb-4">
                                    Payment Summary
                                </h3>
                                <div className="space-y-3 font-body-md text-body-md">
                                    <div className="flex justify-between">
                                        <span className="text-on-surface-variant">Subtotal</span>
                                        <span>{formatTotal(order.total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-on-surface-variant">Shipping</span>
                                        <span>{formatTotal(order.shipping || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-on-surface-variant">Tax</span>
                                        <span>{formatTotal(order.tax || 0)}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t premium-border font-bold">
                                        <span>Total</span>
                                        <span>{formatTotal(order.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="border premium-border bg-white p-stack-sm">
                                <h3 className="font-headline-sm text-headline-sm text-primary mb-4">
                                    Shipping Address
                                </h3>
                                <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                                    {shippingLines.length > 0 ? (
                                        shippingLines.map((line, idx) => <p key={idx}>{line}</p>)
                                    ) : (
                                        <p>—</p>
                                    )}
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="border premium-border bg-white p-stack-sm">
                                <h3 className="font-headline-sm text-headline-sm text-primary mb-4">
                                    Customer
                                </h3>
                                <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                                    <p className="font-medium text-primary">
                                        {orderCustomer.name || order?.email || '—'}
                                    </p>
                                    <p>{order?.email || orderCustomer.email || '—'}</p>
                                    {order?.phone && <p className="mt-2 text-label-sm">{order.phone}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
