'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React from 'react';
import Button from '../../../../../_components/Admin/Button';
import {
  MdArrowBack,
  MdCheck,
  MdEdit,
  MdLocalShipping,
  MdCreditCard,
  MdError,
  MdSchedule,
} from 'react-icons/md';

const getStatusBadge = (status) => {
  const styles = {
    Paid: 'bg-primary-container/20 text-primary-container',
    'Partially Paid': 'bg-surface-container-high text-on-surface-variant',
    Pending: 'bg-tertiary-container/20 text-tertiary',
    Refunded: 'bg-error-container/20 text-error',
    Unfulfilled: 'bg-tertiary-container/20 text-tertiary',
    Fulfilled: 'bg-primary-container/20 text-primary-container',
    Returned: 'bg-error-container/20 text-error',
  };
  return styles[status] || 'bg-surface-container-high text-on-surface-variant';
};

const formatCurrency = (value) =>
  `Rs ${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const OrderDetailPage = () => {
  const params = useParams();
  const id = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
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
  }, [id]);

  if (loading) {
    return (
      <main className="pt-4 px-margin-desktop pb-20">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center py-40">
          <span className="text-on-surface-variant font-body-md">Loading order…</span>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="pt-4 px-margin-desktop pb-20">
        <div className="max-w-[1400px] mx-auto">
          <Link
            className="text-primary hover:underline flex items-center gap-1 font-body-sm text-body-sm mb-6"
            href="/admin/orders"
          >
            <MdArrowBack size={16} />
            Back to Orders
          </Link>
          <div className="bg-error-container/20 border border-error/30 text-error p-6 rounded">
            <p className="font-bold mb-1">Order not found</p>
            <p className="text-body-sm">{error || 'This order does not exist.'}</p>
          </div>
        </div>
      </main>
    );
  }

  const lineItems = order.lineItems || [];
  const customer = order.customer || {};
  const isPaid = order.paymentStatus === 'Paid' || order.paymentStatus === 'Partially Paid';
  const isFulfilled = order.fulfillmentStatus === 'Fulfilled';
  const customerInitials = (customer.name || order.email || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const shippingLines = [
    customer.name,
    order.address,
    order.apartment,
    [order.city, order.postalCode].filter(Boolean).join(', '),
    order.country,
  ].filter(Boolean);

  return (
    <>
      {/* Main Content Canvas */}
      <main className="pt-4 px-margin-desktop pb-20">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  className="text-primary hover:underline flex items-center gap-1 font-body-sm text-body-sm"
                  href="/admin/orders"
                >
                  <MdArrowBack size={16} />
                  Back to Orders
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <h2 className="font-headline-lg text-headline-lg font-black">Order {order.orderId}</h2>
                <span className={`px-2 py-1 ${getStatusBadge(order.paymentStatus)} font-label-md text-label-md rounded`}>
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {formatDate(order.date || order.createdAt)} at {formatTime(order.date || order.createdAt)} from{' '}
                {order.channel || 'Online Store'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                Archive
              </Button>
              <Button variant="primary" size="sm">
                Print Invoice
              </Button>
            </div>
          </div>

          {/* Bento Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
            {/* Left Column (8 cols) */}
            <div className="lg:col-span-8 space-y-lg">
              {/* Order Items Card */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded overflow-hidden">
                <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                  <h3 className="font-headline-md text-headline-md">Order items</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body-md text-body-md">
                    <thead>
                      <tr className="bg-surface-container-low/50">
                        <th className="p-4 font-label-md text-label-md text-on-surface-variant">Product</th>
                        <th className="p-4 font-label-md text-label-md text-on-surface-variant">Price</th>
                        <th className="p-4 font-label-md text-label-md text-on-surface-variant">Quantity</th>
                        <th className="p-4 text-right font-label-md text-label-md text-on-surface-variant">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {lineItems.length === 0 && (
                        <tr>
                          <td className="p-4 text-on-surface-variant" colSpan={4}>
                            No items recorded for this order.
                          </td>
                        </tr>
                      )}
                      {lineItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-bold">{item.title}</p>
                              {(item.size || item.color) && (
                                <p className="text-body-sm text-on-surface-variant">
                                  {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
                                    .filter(Boolean)
                                    .join(', ')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">{formatCurrency(item.price)}</td>
                          <td className="p-4">{item.quantity}</td>
                          <td className="p-4 text-right font-bold">
                            {formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded p-lg">
                <h3 className="font-headline-md text-headline-md mb-6">Order timeline</h3>
                <div className="relative">
                  <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-outline-variant"></div>
                  <div className="space-y-8">
                    {/* Step 1 — placed */}
                    <div className="relative flex items-start pl-8">
                      <div className="absolute left-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                        <MdCheck size={14} className="text-on-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold">Order placed</p>
                          <p className="text-body-sm text-on-surface-variant">
                            {formatDate(order.date || order.createdAt)} {formatTime(order.date || order.createdAt)}
                          </p>
                        </div>
                        <p className="text-body-sm text-on-surface-variant">
                          Customer placed an order via the {order.channel || 'Online Store'}.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 — payment */}
                    <div className="relative flex items-start pl-8">
                      {isPaid ? (
                        <div className="absolute left-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                          <MdCheck size={14} className="text-on-primary" />
                        </div>
                      ) : (
                        <div className="absolute left-0 w-6 h-6 rounded-full border-2 border-primary bg-surface-container-lowest flex items-center justify-center z-10">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold">Payment {isPaid ? 'processed' : 'pending'}</p>
                          <p className="text-body-sm text-on-surface-variant">
                            {isPaid ? order.paymentStatus : 'Awaiting payment'}
                          </p>
                        </div>
                        <p className="text-body-sm text-on-surface-variant">
                          {isPaid
                            ? `Transaction approved. Total ${formatCurrency(order.total)}.`
                            : `Payment method: ${order.paymentMethod || '—'}.`}
                        </p>
                      </div>
                    </div>

                    {/* Step 3 — fulfillment */}
                    <div className="relative flex items-start pl-8">
                      {isFulfilled ? (
                        <div className="absolute left-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                          <MdCheck size={14} className="text-on-primary" />
                        </div>
                      ) : (
                        <div className="absolute left-0 w-6 h-6 rounded-full border-2 border-primary bg-surface-container-lowest flex items-center justify-center z-10">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-primary">
                            {isFulfilled ? 'Fulfilled' : 'Pending fulfillment'}
                          </p>
                          <p className="text-body-sm text-on-surface-variant">
                            {isFulfilled ? 'Complete' : 'Current'}
                          </p>
                        </div>
                        <p className="text-body-sm text-on-surface-variant">
                          {isFulfilled
                            ? 'The order has been packed and shipped.'
                            : 'The order is ready to be picked and packed.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded p-lg">
                <h3 className="font-headline-md text-headline-md mb-4">Notes</h3>
                <textarea
                  className="w-full h-32 p-3 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded font-body-md text-body-md"
                  placeholder="Add a note to this order..."
                  defaultValue={order.note || ''}
                ></textarea>
                <div className="flex justify-end mt-4">
                  <button className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity rounded active:scale-[0.98]">
                    Save Note
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-lg">
              {/* Fulfillment Card */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded p-lg">
                <h3 className="font-headline-md text-headline-md mb-4">Fulfillment</h3>
                <p className="text-body-sm text-on-surface-variant mb-6">
                  {lineItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)} item(s) ·{' '}
                  {order.fulfillmentStatus || 'Unfulfilled'}.
                </p>
                <div className="space-y-3">
                  <button className="w-full py-3 bg-primary text-on-primary font-bold text-body-md hover:opacity-90 transition-opacity rounded shadow-sm active:scale-[0.98]">
                    Mark as Fulfilled
                  </button>
                  <button className="w-full py-3 border border-error text-error font-bold text-body-md hover:bg-error-container/10 transition-colors rounded active:scale-[0.98]">
                    Refund
                  </button>
                </div>
              </div>

              {/* Customer Card */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded p-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-headline-md text-headline-md">Customer</h3>
                  <Link className="text-primary font-label-md text-label-md hover:underline" href="#">
                    Edit
                  </Link>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-secondary">
                    {customer.avatar || customerInitials}
                  </div>
                  <div>
                    <p className="font-bold">{customer.name || '—'}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      {order.items} item(s) · {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-outline-variant">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Email</p>
                    <p className="font-body-md text-body-md text-primary">{order.email || customer.email || '—'}</p>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Phone</p>
                    <p className="font-body-md text-body-md">{order.phone || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded p-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-headline-md text-headline-md">Shipping Address</h3>
                  <MdEdit className="text-on-surface-variant cursor-pointer" size={18} />
                </div>
                <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {shippingLines.length > 0 ? (
                    shippingLines.map((line, idx) => <p key={idx}>{line}</p>)
                  ) : (
                    <p>—</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-outline-variant">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <MdLocalShipping size={18} />
                    <p className="font-body-sm text-body-sm">
                      {order.shippingMethod || 'Standard Shipping'} · {order.fulfillmentStatus || 'Unfulfilled'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded p-lg">
                <h3 className="font-headline-md text-headline-md mb-4">Payment Summary</h3>
                <div className="space-y-3 font-body-md text-body-md">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Shipping</span>
                    <span>{formatCurrency(order.shipping || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Tax</span>
                    <span>{formatCurrency(order.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-outline-variant font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3 p-3 bg-surface-container-low rounded">
                  <MdCreditCard className="text-primary" size={20} />
                  <div>
                    <p className="font-label-md text-label-md capitalize">
                      {order.paymentMethod === 'bank' ? 'Bank Deposit' : 'Cash on Delivery'}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {order.paymentStatus || 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Shell */}
      <footer className="ml-60 bg-surface-container-lowest border-t border-outline-variant w-[calc(100%-240px)] py-lg mt-12">
        <div className="max-w-[1200px] mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
            MERCHANT ADMIN SYSTEM
          </div>
          <div className="flex gap-lg font-body-sm text-body-sm text-on-surface-variant">
            <Link className="hover:text-primary transition-colors" href="#">
              Privacy Policy
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              Terms of Service
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              Shipping Info
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              Contact Us
            </Link>
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            © 2024 Multi-Tenant eCommerce Platform.
          </div>
        </div>
      </footer>
    </>
  );
};

export default OrderDetailPage;
