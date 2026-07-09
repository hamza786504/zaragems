'use client';

import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import useSlotData from './useSlotData';
import SlotShell from './SlotShell';

export default function CollectionDistSlot({ intervalMs = 20000 }) {
  const { data, loading, refreshing, lastUpdated, refetch } = useSlotData('/api/dashboard/stats', intervalMs);

  const categoryData = data?.categoryData && data.categoryData.length > 0
    ? data.categoryData
    : [{ name: 'No Products', value: 1, color: '#e1e3e5' }];

  return (
    <SlotShell
      title="Products by Collection"
      subtitle="Inventory share distribution"
      loading={loading}
      refreshing={refreshing}
      lastUpdated={lastUpdated}
      onRefresh={refetch}
    >
      <div className="h-64 flex flex-col justify-between">
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#bdbdbd'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </SlotShell>
  );
}
