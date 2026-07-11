'use client';

import { CheckCircle, Clock, AlertCircle, Package } from 'lucide-react';

const getStatusBadge = (status) => {
  const s = (status || '').toUpperCase();
  const styles = {
    PAID: 'bg-primary-container/10 text-primary',
    PENDING: 'bg-surface-container-high text-on-surface-variant',
    REFUNDED: 'bg-error-container/20 text-error',
    SHIPPED: 'bg-tertiary-container/10 text-tertiary',
    FULFILLED: 'bg-primary-container/10 text-primary',
    UNFULFILLED: 'bg-surface-container-high text-on-surface-variant',
    'PARTIALLY PAID': 'bg-surface-container-high text-on-surface-variant',
    RETURNED: 'bg-error-container/20 text-error',
  };
  const icons = {
    PAID: <CheckCircle size={12} />,
    PENDING: <Clock size={12} />,
    REFUNDED: <AlertCircle size={12} />,
    SHIPPED: <Package size={12} />,
    FULFILLED: <CheckCircle size={12} />,
    UNFULFILLED: <Clock size={12} />,
    'PARTIALLY PAID': <Clock size={12} />,
    RETURNED: <AlertCircle size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[s] || 'bg-surface-container-high text-on-surface-variant'}`}>
      {icons[s] || <Clock size={12} />}{status}
    </span>
  );
};

export default function OrderStatusClient({ orderStatusBreakdown, fulfillmentBreakdown, ordersCount }) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant p-3 md:p-lg shadow-sm">
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h6 className="font-headline-md text-headline-md text-on-surface">Order Status</h6>
          <p className="text-body-sm text-on-surface-variant">Payment & fulfillment breakdown</p>
        </div>
      </div>
      <div className="space-y-md">
        <div>
          <p className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase tracking-wider">Payment</p>
          <div className="space-y-2">
            {Object.entries(orderStatusBreakdown).length > 0 ? Object.entries(orderStatusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">{getStatusBadge(status)}</div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${ordersCount > 0 ? (count / ordersCount) * 100 : 0}%` }} />
                  </div>
                  <span className="font-label-md text-on-surface w-8 text-right">{count}</span>
                </div>
              </div>
            )) : <p className="text-body-sm text-on-surface-variant">No orders yet</p>}
          </div>
        </div>
        <div>
          <p className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase tracking-wider">Fulfillment</p>
          <div className="space-y-2">
            {Object.entries(fulfillmentBreakdown).length > 0 ? Object.entries(fulfillmentBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">{getStatusBadge(status)}</div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary rounded-full" style={{ width: `${ordersCount > 0 ? (count / ordersCount) * 100 : 0}%` }} />
                  </div>
                  <span className="font-label-md text-on-surface w-8 text-right">{count}</span>
                </div>
              </div>
            )) : <p className="text-body-sm text-on-surface-variant">No orders yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
