'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle, Clock, AlertCircle, Package } from 'lucide-react';
import useSlotData from './useSlotData';
import SlotShell from './SlotShell';

const PKR = (val) => `Rs ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const getStatusBadge = (status) => {
  const formattedStatus = (status || '').toUpperCase();
  const styles = {
    PAID: 'bg-primary-container/10 text-primary',
    PENDING: 'bg-surface-container-high text-on-surface-variant',
    REFUNDED: 'bg-error-container/20 text-error',
    SHIPPED: 'bg-tertiary-container/10 text-tertiary',
    FULFILLED: 'bg-primary-container/10 text-primary',
    UNFULFILLED: 'bg-surface-container-high text-on-surface-variant',
    'PARTIALLY PAID': 'bg-surface-container-high text-on-surface-variant',
  };
  const icons = {
    PAID: <CheckCircle size={12} />,
    PENDING: <Clock size={12} />,
    REFUNDED: <AlertCircle size={12} />,
    SHIPPED: <Package size={12} />,
    FULFILLED: <CheckCircle size={12} />,
    UNFULFILLED: <Clock size={12} />,
    'PARTIALLY PAID': <Clock size={12} />,
  };
  const badgeStyle = styles[formattedStatus] || 'bg-surface-container-high text-on-surface-variant';
  const badgeIcon = icons[formattedStatus] || <Clock size={12} />;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle}`}>
      {badgeIcon}{status}
    </span>
  );
};

export default function RecentOrdersSlot({ intervalMs = 10000 }) {
  const { data, loading, refreshing, lastUpdated, refetch } = useSlotData('/api/dashboard/stats', intervalMs);

  const recentOrders = data?.recentOrders || [];

  return (
    <SlotShell
      title="Recent Orders"
      subtitle="Latest transactions — auto-refreshes"
      loading={loading}
      refreshing={refreshing}
      lastUpdated={lastUpdated}
      onRefresh={refetch}
      actionLink="/admin/orders"
      actionLabel={<>View All <ArrowUpRight size={14} /></>}
      className="overflow-hidden flex flex-col"
    >
      <div className="flex-1 overflow-y-auto max-h-100">
        {recentOrders.length > 0 ? (
          <table className="w-full text-left">
            <tbody className="divide-y divide-outline-variant">
              {recentOrders.map((order, index) => (
                <tr key={order._id || index} className="hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <td className="p-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                        <span className="text-xs font-bold text-on-surface-variant">
                          {order.customer?.avatar || order.customer?.name?.split(' ').map(n => n[0]).join('') || 'O'}
                        </span>
                      </div>
                      <div>
                        <p className="font-label-md text-on-surface group-hover:text-primary transition-colors">{order.orderId}</p>
                        <p className="text-body-sm text-on-surface-variant">{order.customer?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-md text-right">
                    <p className="font-label-md text-on-surface">{PKR(order.total)}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      {getStatusBadge(order.paymentStatus)}
                    </div>
                  </td>
                  <td className="p-md text-right">
                    <p className="text-body-sm text-on-surface-variant">
                      {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-lg text-center text-on-surface-variant">No orders recorded yet.</div>
        )}
      </div>
    </SlotShell>
  );
}
