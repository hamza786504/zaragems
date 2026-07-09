'use client';

import React from 'react';
import { Package, Users, ShoppingCart } from 'lucide-react';
import { MdRateReview } from 'react-icons/md';
import useSlotData from './useSlotData';
import SlotShell from './SlotShell';

export default function DatabaseOverviewSlot({ intervalMs = 30000 }) {
  const { data, loading, refreshing, lastUpdated, refetch } = useSlotData('/api/dashboard/stats', intervalMs);

  const metricsData = data?.metrics || {};
  const productStatusBreakdown = data?.productStatusBreakdown || {};

  const items = [
    { label: 'Products', count: metricsData.productsCount || 0, icon: Package, color: 'bg-primary-container/10 text-primary' },
    { label: 'Customers', count: metricsData.customersCount || 0, icon: Users, color: 'bg-secondary-container/30 text-secondary' },
    { label: 'Orders', count: metricsData.ordersCount || 0, icon: ShoppingCart, color: 'bg-tertiary-container/10 text-tertiary' },
    { label: 'Reviews', count: metricsData.reviewsCount || 0, icon: MdRateReview, color: 'bg-primary-fixed/30 text-primary' },
  ];

  return (
    <SlotShell
      title="Database Overview"
      subtitle="Record counts & inventory"
      loading={loading}
      refreshing={refreshing}
      lastUpdated={lastUpdated}
      onRefresh={refetch}
    >
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-sm rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color}`}>
                <item.icon size={16} />
              </div>
              <span className="font-label-md text-on-surface">{item.label}</span>
            </div>
            <span className="font-headline-md text-on-surface">{item.count.toLocaleString()}</span>
          </div>
        ))}
        {Object.keys(productStatusBreakdown).length > 0 && (
          <div className="mt-md pt-md border-t border-outline-variant">
            <p className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase tracking-wider">Product Status</p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(productStatusBreakdown).map(([status, count]) => (
                <span key={status} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold">
                  {status}: {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </SlotShell>
  );
}
