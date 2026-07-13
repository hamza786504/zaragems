'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../store/authContext';

const ITEMS_PER_PAGE = 5;

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

export default function Orders() {
    const { customer, isAuthenticated } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
    const [userOrders, setUserOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [ordersError, setOrdersError] = useState(null);

    // Fetch user's real orders
    useEffect(() => {
        if (isAuthenticated && customer?.email) {
            setLoadingOrders(true);
            fetch(`/api/account/orders`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.orders) {
                        setUserOrders(data.orders);
                    } else if (!data.success) {
                        setOrdersError(data.error || 'Failed to load orders');
                    }
                })
                .catch(() => {
                    setOrdersError('Failed to load orders');
                })
                .finally(() => setLoadingOrders(false));
        }
    }, [isAuthenticated, customer?.email]);

    // Calculate pagination based on real user orders
    const totalPages = Math.max(1, Math.ceil(userOrders.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentOrders = userOrders.slice(startIndex, endIndex);

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

    return (
        <section>
            <div className="flex justify-between items-end mb-stack-sm border-b premium-border pb-4">
                <div>
                    <h2 className="font-headline-md text-headline-sm text-primary">
                        All Orders
                    </h2>
                    <p className="text-label-sm text-on-surface-variant mt-1">
                        Showing {startIndex + 1}-{Math.min(endIndex, userOrders.length)} of {userOrders.length} orders
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
                                    key={order._id || order.id}
                                    className="hover:bg-surface-container-lowest transition-colors"
                                >
                                    <td className="p-4 text-primary font-medium">
                                        {order.orderId || order.id}
                                    </td>
                                    <td className="p-4 text-on-surface-variant">
                                        {order.date}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-label-sm ${getStatusColor(order.status)}`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-primary font-display-lg text-body-lg">
                                        {formatTotal(order.total)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/orders/${order._id || order.id}`}
                                            className="font-label-sm text-label-sm text-secondary hover:text-primary font-bold"
                                        >
                                            View Details
                                        </Link>
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
    );
}
