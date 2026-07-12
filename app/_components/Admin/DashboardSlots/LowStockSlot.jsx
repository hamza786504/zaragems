'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Package, CheckCircle } from 'lucide-react';
import useSlotData from './useSlotData';
import SlotShell from './SlotShell';

export default function LowStockSlot({ intervalMs = 20000 }) {
  const { data, loading, refreshing, lastUpdated, refetch } = useSlotData('/api/dashboard/stats', intervalMs);

  const lowStockProducts = data?.lowStockProducts || [];

  return (
    <SlotShell
      title="Low Stock Alert"
      subtitle="Products with inventory ≤ 5"
      loading={loading}
      refreshing={refreshing}
      lastUpdated={lastUpdated}
      onRefresh={refetch}
      actionLink="/admin/products"
      actionLabel={<>View All <ArrowUpRight size={14} /></>}
    >
      <div className="space-y-3">
        {lowStockProducts.length > 0 ? lowStockProducts.map((product) => (
          <div key={product._id || product.slug} className="flex items-center justify-between p-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${product.inventory === 0 ? 'bg-error-container/20 text-error' : 'bg-warning-container/20 text-warning'}`}>
                <Package size={16} />
              </div>
              <div>
                <p className="font-label-md text-on-surface truncate max-w-35">{product.title}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {product.inventory === null || product.inventory === undefined
                    ? 'Untracked'
                    : product.inventory === 0
                    ? 'Out of stock'
                    : `${product.inventory} left`}
                </p>
              </div>
            </div>
            <span className={`font-label-md ${product.inventory === 0 ? 'text-error' : 'text-warning'}`}>
              {product.inventory ?? '—'}
            </span>
          </div>
        )) : (
          <div className="text-center py-lg text-on-surface-variant">
            <CheckCircle size={24} className="mx-auto mb-2 text-primary" />
            <p className="text-body-sm">All products well stocked!</p>
          </div>
        )}
      </div>
    </SlotShell>
  );
}
