// app/admin/orders/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../../_components/Admin/Button';
import {
  MdLocalShipping,
  MdPrint,
  MdArchive,
  MdCheckCircle,
  MdKeyboardReturn,
  MdPending,
  MdError,
  MdSchedule,
  MdCurrencyExchange,
  MdHelp,
  MdShoppingCart,
  MdChevronLeft,
  MdChevronRight,
  MdRefresh,
  MdDelete,
  MdUnarchive,
} from 'react-icons/md';
import Link from 'next/link';
const PAYMENT_STATUSES = ['All', 'Paid', 'Partially Paid', 'Pending', 'Refunded'];
const FULFILLMENT_STATUSES = ['All', 'Fulfilled', 'Unfulfilled', 'Pending', 'Returned'];
const LIMIT = 10;

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('All');
  const [orderStatusFilter, setOrderStatusFilter] = useState('active');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: LIMIT,
      });
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (paymentFilter !== 'All') params.set('paymentStatus', paymentFilter);
      if (fulfillmentFilter !== 'All') params.set('fulfillmentStatus', fulfillmentFilter);
      params.set('orderStatus', orderStatusFilter);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch orders.');
      setOrders(data.orders || []);
      setTotalOrders(data.totalOrders || 0);
      setTotalPages(data.totalPages || 1);
      setSelectedOrders([]);
      setSelectAll(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, paymentFilter, fulfillmentFilter, orderStatusFilter]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, paymentFilter, fulfillmentFilter, orderStatusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedOrders(orders.map((o) => o._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) return prev.filter((id) => id !== orderId);
      return [...prev, orderId];
    });
  };

  const handleArchiveOrder = async (id, currentStatus) => {
    const newStatus = currentStatus === 'archived' ? 'active' : 'archived';
    if (!confirm(`Are you sure you want to ${newStatus === 'archived' ? 'archive' : 'unarchive'} this order?`)) return;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update order.');
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this order?')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete order.');
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkArchiveOrders = async (archive = true) => {
    const newStatus = archive ? 'archived' : 'active';
    if (selectedOrders.length === 0) return;
    if (!confirm(`Are you sure you want to ${archive ? 'archive' : 'unarchive'} the ${selectedOrders.length} selected orders?`)) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedOrders, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update orders.');
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkDeleteOrders = async () => {
    if (selectedOrders.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete these ${selectedOrders.length} orders?`)) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedOrders }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete orders.');
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

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

  const getFulfillmentIcon = (status) => {
    switch (status) {
      case 'Fulfilled': return <MdCheckCircle size={14} />;
      case 'Returned': return <MdKeyboardReturn size={14} />;
      default: return <MdPending size={14} />;
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return <MdCheckCircle size={14} />;
      case 'Partially Paid': return <MdError size={14} />;
      case 'Pending': return <MdSchedule size={14} />;
      case 'Refunded': return <MdCurrencyExchange size={14} />;
      default: return <MdHelp size={14} />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const pendingFulfillment = orders.filter(
    (o) => o.fulfillmentStatus === 'Unfulfilled' || o.fulfillmentStatus === 'Pending'
  ).length;

  const buildPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <>
      <div className="flex flex-col h-screen">
        <main className="flex-1 p-0 md:p-xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-xl">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Orders</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {loading ? 'Loading orders...' : `${totalOrders} total orders`}
              </p>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors text-label-md font-label-md"
            >
              <MdRefresh size={18} />
              Refresh
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-xl">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
              <p className="text-label-md text-on-surface-variant mb-1">Total Orders</p>
              <p className="text-headline-md font-headline-md text-on-surface">{totalOrders}</p>
              <p className="text-body-sm text-on-surface-variant mt-1">
                <span className="text-primary">All time</span>
              </p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
              <p className="text-label-md text-on-surface-variant mb-1">Pending Fulfillment</p>
              <p className="text-headline-md font-headline-md text-on-surface">{pendingFulfillment}</p>
              <p className="text-body-sm text-on-surface-variant mt-1">Requires attention</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
              <p className="text-label-md text-on-surface-variant mb-1">This Page</p>
              <p className="text-headline-md font-headline-md text-on-surface">{orders.length}</p>
              <p className="text-body-sm text-on-surface-variant mt-1">Page {currentPage} of {totalPages}</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
              <p className="text-label-md text-on-surface-variant mb-1">Selected</p>
              <p className="text-headline-md font-headline-md text-on-surface">{selectedOrders.length}</p>
              <p className="text-body-sm text-on-surface-variant mt-1">For bulk actions</p>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-lg flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </span>
              <input
                className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg bg-transparent text-body-md focus:outline-none focus:border-primary transition-colors"
                placeholder="Search by order ID, customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Payment Status Filter */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase text-xs">Payment:</span>
              {PAYMENT_STATUSES.map((status) => (
                <button
                  key={status}
                  className={`px-3 py-1.5 rounded-full border text-label-md font-label-md transition-colors ${paymentFilter === status ? 'bg-primary-container text-on-primary-container border-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}
                  onClick={() => setPaymentFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Fulfillment Status Filter */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase text-xs">Fulfillment:</span>
              {FULFILLMENT_STATUSES.map((status) => (
                <button
                  key={status}
                  className={`px-3 py-1.5 rounded-full border text-label-md font-label-md transition-colors ${fulfillmentFilter === status ? 'bg-secondary-container text-on-secondary-container border-secondary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}
                  onClick={() => setFulfillmentFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Order Status Filter */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase text-xs">Status:</span>
              {['active', 'archived', 'All'].map((status) => (
                <button
                  key={status}
                  className={`px-3 py-1.5 rounded-full border text-label-md font-label-md capitalize transition-colors ${orderStatusFilter === status ? 'bg-tertiary-container text-on-tertiary-container border-tertiary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}
                  onClick={() => setOrderStatusFilter(status)}
                >
                  {status === 'active' ? 'Active' : status === 'archived' ? 'Archived' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedOrders.length > 0 && (
            <div className="bg-primary-container/10 border border-primary/20 p-3 mb-base flex items-center gap-4 rounded-xl flex-wrap">
              <p className="font-label-md text-label-md text-primary">
                {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
              </p>
              <div className="h-6 w-px bg-primary/20" />
              <Button variant="text" size="sm" icon={<MdLocalShipping size={18} />}>Fulfill</Button>
              <Button variant="text" size="sm" icon={<MdPrint size={18} />}>Print Invoices</Button>
              {orderStatusFilter === 'archived' ? (
                <Button variant="text" size="sm" onClick={() => handleBulkArchiveOrders(false)} icon={<MdUnarchive size={18} />}>Unarchive</Button>
              ) : (
                <Button variant="text" size="sm" onClick={() => handleBulkArchiveOrders(true)} icon={<MdArchive size={18} />}>Archive</Button>
              )}
              <Button variant="danger" size="sm" onClick={handleBulkDeleteOrders} icon={<MdDelete size={18} />}>Delete</Button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-error-container/20 border border-error/30 text-error text-label-md p-4 rounded-xl mb-base">
              {error} —{' '}
              <button onClick={fetchOrders} className="underline">Retry</button>
            </div>
          )}

          {/* Orders Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-2 py-2 text-left">
                      <input
                        className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5 cursor-pointer"
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-2 py-2 text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Order</th>
                    <th className="px-2 py-2 text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Customer</th>
                    <th className="px-2 py-2 text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Date</th>
                    <th className="px-2 py-2 text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Fulfillment</th>
                    <th className="px-2 py-2 text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Payment</th>
                    <th className="px-2 py-2 text-right font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total</th>
                    <th className="px-2 py-2 text-right font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Items</th>
                    <th className="px-2 py-2 text-center font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-2 py-2"><div className="w-5 h-5 bg-surface-container rounded" /></td>
                        <td className="px-2 py-2"><div className="h-4 bg-surface-container rounded w-24" /></td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-surface-container rounded-full" />
                            <div className="space-y-1">
                              <div className="h-3 bg-surface-container rounded w-32" />
                              <div className="h-2 bg-surface-container rounded w-40" />
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2"><div className="h-4 bg-surface-container rounded w-20" /></td>
                        <td className="px-2 py-2"><div className="h-6 bg-surface-container rounded-full w-24" /></td>
                        <td className="px-2 py-2"><div className="h-6 bg-surface-container rounded-full w-16" /></td>
                        <td className="px-2 py-2 text-right"><div className="h-4 bg-surface-container rounded w-16 ml-auto" /></td>
                        <td className="px-2 py-2 text-right"><div className="h-4 bg-surface-container rounded w-6 ml-auto" /></td>
                        <td className="px-2 py-2 text-center"><div className="h-4 bg-surface-container rounded w-16 mx-auto" /></td>
                      </tr>
                    ))
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order._id}
                        className={`hover:bg-surface-container-low transition-colors cursor-pointer group ${selectedOrders.includes(order._id) ? 'bg-primary-container/5' : ''}`}
                      >
                        <td className="px-2 py-2">
                          <input
                            className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5 cursor-pointer"
                            type="checkbox"
                            checked={selectedOrders.includes(order._id)}
                            onChange={() => handleSelectOrder(order._id)}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Link className="text-primary text-[10px] font-label-md text-label-md font-bold hover:underline" href={`/admin/orders/order-details/${order._id}`}>
                            {order.orderId}
                          </Link>
                          <div className="flex gap-1 mt-1">
                            {(order.tags || []).map((tag) => (
                              <span key={tag} className="px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[10px] font-bold">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center font-bold text-secondary text-[12px]">
                              {order.customer?.avatar || (order.customer?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-body-md text-body-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                                {order.customer?.name}
                              </p>
                              <p className="text-label-md text-on-surface-variant">{order.customer?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <p className="font-body-md text-body-md text-on-surface">{formatDate(order.date || order.createdAt)}</p>
                          <p className="text-label-md text-on-surface-variant">{formatTime(order.date || order.createdAt)}</p>
                          <p className="text-label-md text-on-surface-variant">{order.channel || 'Online Store'}</p>
                        </td>
                        <td className="p-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-md font-label-md ${getStatusBadge(order.fulfillmentStatus)}`}>
                            {getFulfillmentIcon(order.fulfillmentStatus)}
                            {order.fulfillmentStatus}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-md font-label-md ${getStatusBadge(order.paymentStatus)}`}>
                            {getPaymentStatusIcon(order.paymentStatus)}
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          <p className="font-body-md text-body-md text-on-surface font-bold">
                            Rs. {Number(order.total || 0).toLocaleString()}
                          </p>
                        </td>
                        <td className="p-2 text-right">
                          <p className="font-body-md text-body-md text-on-surface">{order.items}</p>
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {order.status === 'archived' ? (
                              <button
                                title="Unarchive Order"
                                onClick={(e) => { e.stopPropagation(); handleArchiveOrder(order._id, order.status); }}
                                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors"
                              >
                                <MdUnarchive size={18} />
                              </button>
                            ) : (
                              <button
                                title="Archive Order"
                                onClick={(e) => { e.stopPropagation(); handleArchiveOrder(order._id, order.status); }}
                                className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-surface-container rounded transition-colors"
                              >
                                <MdArchive size={18} />
                              </button>
                            )}
                            <button
                              title="Delete Order"
                              onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order._id); }}
                              className="p-1.5 text-on-surface-variant hover:text-error hover:bg-surface-container rounded transition-colors"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {!loading && orders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-32 h-32 bg-surface-container rounded-full flex items-center justify-center mb-6">
                  <MdShoppingCart size={64} className="text-outline-variant" />
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No orders found</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Try adjusting your search or filter criteria.
                </p>
                <button
                  className="text-primary font-label-md text-label-md hover:underline"
                  onClick={() => { setSearchTerm(''); setPaymentFilter('All'); setFulfillmentFilter('All'); }}
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination Footer */}
            <div className="px-lg py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between flex-wrap gap-3">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Showing {orders.length > 0 ? (currentPage - 1) * LIMIT + 1 : 0}–{Math.min(currentPage * LIMIT, totalOrders)} of {totalOrders} orders
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <MdChevronLeft size={20} />
                </button>
                {buildPageNumbers().map((page, idx) =>
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-outline-variant">…</span>
                  ) : (
                    <button
                      key={page}
                      className={`px-3 py-1 rounded-lg font-label-md text-label-md transition-colors ${currentPage === page ? 'bg-primary-container text-on-primary-container' : 'border border-outline-variant hover:bg-surface-container-high'}`}
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <MdChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default OrdersPage;