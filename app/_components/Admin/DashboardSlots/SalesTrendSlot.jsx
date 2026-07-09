'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { DollarSign } from 'lucide-react';
import useSlotData from './useSlotData';
import SlotShell from './SlotShell';

const PKR = (val) => `Rs ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-xl rounded-lg p-4 border border-gray-100">
        <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color || '#006c50' }}>
            {entry.name}: {PKR(parseFloat(entry.value))}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SalesTrendSlot({ intervalMs = 15000 }) {
  const { data, loading, refreshing, lastUpdated, refetch } = useSlotData('/api/dashboard/stats', intervalMs);

  const salesTrendData = data?.salesTrendData || [];

  return (
    <SlotShell
      title="Sales Over Time"
      subtitle="Real-time transaction values aggregated by date"
      loading={loading}
      refreshing={refreshing}
      lastUpdated={lastUpdated}
      onRefresh={refetch}
      className="lg:col-span-2"
    >
      <div className="h-80 w-full">
        {salesTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006c50" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#006c50" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => `Rs ${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="sales" name="Gross Sales"
                stroke="#006c50" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)"
                dot={{ r: 4, fill: '#006c50', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, fill: '#006c50', strokeWidth: 3, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-on-surface-variant bg-surface-container-low rounded-lg">
            No sales data yet. Seed data to populate charts.
          </div>
        )}
      </div>
    </SlotShell>
  );
}
