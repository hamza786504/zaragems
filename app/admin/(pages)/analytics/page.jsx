// app/analytics/page.jsx
'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, TrendingDown, Download, PackageCheck, PackageX } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import useSlotData from '../../../_components/Admin/DashboardSlots/useSlotData';

const PKR = (val) => `Rs ${Number(val || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-xl rounded-lg p-4 border border-gray-100">
        <p className="text-sm font-bold text-gray-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatter ? formatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Fixed-height stand-in shown while a chart/table's data is loading, so the
// bento grid never reflows between the loading and loaded states.
const ChartSkeleton = ({ height = 300 }) => (
  <div className="bg-surface-container-low animate-pulse rounded-lg w-full" style={{ height }} />
);

const EmptyState = ({ message, height = 300 }) => (
  <div
    className="flex items-center justify-center text-on-surface-variant text-sm bg-surface-container-low rounded-lg w-full"
    style={{ height }}
  >
    {message}
  </div>
);

const stockBadge = (inventory) => {
  if (inventory === null || inventory === undefined) return { label: 'Untracked', className: 'bg-surface-container-high text-on-surface-variant' };
  if (inventory <= 0) return { label: 'Out of Stock', className: 'bg-error-container text-error' };
  if (inventory <= 5) return { label: 'Low Stock', className: 'bg-error-container/60 text-error' };
  return { label: 'In Stock', className: 'text-primary bg-primary-container/10' };
};

const statusBadge = (status) => {
  const styles = {
    active: 'text-primary bg-primary-container/10',
    draft: 'bg-surface-variant text-on-surface-variant',
    archived: 'bg-error-container text-error',
  };
  return styles[status] || 'bg-surface-variant text-on-surface-variant';
};

const AnalyticsPage = () => {
  const [activeTimeView, setActiveTimeView] = useState('Daily');
  const [hoveredCard, setHoveredCard] = useState(null);

  const { data, loading, refreshing, lastUpdated, refetch } = useSlotData('/api/dashboard/stats', 20000);

  const timeViews = ['Daily', 'Monthly'];

  const metricsData = data?.metrics;
  const salesTrendData = data?.salesTrendData || [];
  const monthlyRevenue = data?.monthlyRevenue || [];
  const categoryData = data?.categoryData || [];
  const revenueByStatus = data?.revenueByStatus || [];
  const topProducts = data?.topProductsByValue || [];
  const lowStockCount = data?.lowStockCount || 0;

  // "Daily" shows the last 15 days of real orders; "Monthly" shows the last 6 months.
  // Both are genuinely available from the API — there's no separate weekly rollup,
  // so the toggle only offers the granularities we can actually back with real data.
  const trendChartData = activeTimeView === 'Daily'
    ? salesTrendData
    : monthlyRevenue.map((m) => ({ date: m.month, sales: m.revenue, orders: m.orders }));

  const totalProductsInView = categoryData.reduce((sum, c) => sum + c.value, 0);

  const metrics = metricsData ? [
    {
      title: 'Total Sales',
      value: PKR(metricsData.totalSales),
      change: `${metricsData.salesChange >= 0 ? '+' : ''}${metricsData.salesChange}%`,
      positive: metricsData.salesChange >= 0,
      comparison: 'Compared to previous 30 days',
    },
    {
      title: 'Total Orders',
      value: metricsData.ordersCount.toLocaleString(),
      change: `${metricsData.ordersChange >= 0 ? '+' : ''}${metricsData.ordersChange}%`,
      positive: metricsData.ordersChange >= 0,
      comparison: 'Compared to previous 30 days',
    },
    {
      title: 'Avg. Order Value',
      value: PKR(metricsData.avgOrderValue),
      change: `${metricsData.avgOrderChange >= 0 ? '+' : ''}${metricsData.avgOrderChange}%`,
      positive: metricsData.avgOrderChange >= 0,
      comparison: 'Per unique transaction',
    },
    {
      title: 'Total Customers',
      value: metricsData.customersCount.toLocaleString(),
      change: `${metricsData.customersChange >= 0 ? '+' : ''}${metricsData.customersChange}%`,
      positive: metricsData.customersChange >= 0,
      comparison: `${metricsData.newCustomersCurrent} new in last 30 days`,
    },
    {
      title: 'Total Products',
      value: metricsData.productsCount.toLocaleString(),
      change: lowStockCount > 0 ? `${lowStockCount} Low Stock` : 'All Stocked',
      positive: lowStockCount === 0,
      comparison: 'Across all collections',
      icon: lowStockCount > 0 ? PackageX : PackageCheck,
    },
  ] : [];

  return (
    <main className="px-lg pb-12 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Analytics Overview
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Real-time performance and shop health data.
            {lastUpdated && <span className="ml-2 opacity-70">Updated: {lastUpdated}</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch(false)}
            className="bg-surface-container hover:bg-surface-container-high px-6 py-2.5 rounded-lg font-label-md text-label-md text-on-surface transition-all flex items-center gap-2"
          >
            <Download size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {(loading || metrics.length === 0
          ? Array.from({ length: 5 })
          : metrics
        ).map((metric, index) => (
          <div
            key={index}
            className="card-surface p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden min-h-[148px]"
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {metric ? (
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    {metric.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 whitespace-nowrap ${
                      metric.positive
                        ? 'text-primary bg-primary-container/10'
                        : 'text-error bg-error-container'
                    }`}
                  >
                    {metric.icon ? (
                      <metric.icon size={12} />
                    ) : metric.positive ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {metric.change}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="font-display-lg text-display-lg">{metric.value}</h3>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    {metric.comparison}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-pulse">
                <div className="h-3 w-20 bg-surface-container-high rounded" />
                <div className="h-7 w-28 bg-surface-container-high rounded mt-2" />
                <div className="h-3 w-32 bg-surface-container-high rounded" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Layout (Bento Style) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Large Area Chart */}
        <div className="card-surface p-6 col-span-12 lg:col-span-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-headline-md text-headline-md">Sales Over Time</h4>
              <p className="text-sm text-on-surface-variant mt-1">
                Revenue trend for the selected period
              </p>
            </div>
            <div className="flex gap-2 bg-surface-container rounded-lg p-1">
              {timeViews.map((view) => (
                <button
                  key={view}
                  className={`text-[11px] font-bold px-4 py-2 rounded-md transition-all ${
                    activeTimeView === view
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  onClick={() => setActiveTimeView(view)}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-grow min-h-[350px]">
            {loading ? (
              <ChartSkeleton height={350} />
            ) : trendChartData.length === 0 ? (
              <EmptyState message="No orders yet — this chart will populate as sales come in." height={350} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006c50" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#006c50" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    interval={activeTimeView === 'Daily' ? 2 : 0}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(value) => `Rs ${value}`}
                  />
                  <Tooltip content={<CustomTooltip formatter={PKR} />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="Revenue"
                    stroke="#006c50"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    dot={{ r: 4, fill: '#006c50', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, fill: '#006c50', strokeWidth: 3, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Products by Collection Donut */}
        <div className="card-surface p-6 col-span-12 lg:col-span-4 flex flex-col">
          <h4 className="font-headline-md text-headline-md mb-6">Products by Collection</h4>
          <div className="relative flex-grow flex items-center justify-center">
            {loading ? (
              <ChartSkeleton height={300} />
            ) : categoryData.length === 0 ? (
              <EmptyState message="No products yet." height={300} />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">
                    Total Products
                  </span>
                  <span className="text-headline-lg font-headline-lg">{totalProductsInView}</span>
                </div>
              </>
            )}
          </div>
          {!loading && categoryData.length > 0 && (
            <div className="mt-6 space-y-3">
              {categoryData.map((source, index) => (
                <div key={index} className="flex items-center justify-between group hover:bg-surface-container p-2 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: source.color }}
                    ></span>
                    <span className="font-body-sm text-body-sm">{source.name}</span>
                  </div>
                  <span className="font-label-md text-label-md font-bold">{source.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by Payment Status */}
        <div className="card-surface p-6 col-span-12 lg:col-span-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline-md text-headline-md">Revenue by Payment Status</h4>
          </div>
          {loading ? (
            <ChartSkeleton height={300} />
          ) : revenueByStatus.length === 0 ? (
            <EmptyState message="No orders yet." height={300} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `Rs ${value}`} />
                <Tooltip content={<CustomTooltip formatter={PKR} />} />
                <Bar dataKey="revenue" name="Revenue" fill="#006c50" radius={[8, 8, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Daily Order Volume */}
        <div className="card-surface p-6 col-span-12 lg:col-span-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline-md text-headline-md">Daily Order Volume</h4>
          </div>
          {loading ? (
            <ChartSkeleton height={300} />
          ) : salesTrendData.length === 0 ? (
            <EmptyState message="No orders yet." height={300} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} interval={2} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v} orders`} />} />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#5d5e60"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#5d5e60' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Products Table */}
        <div className="card-surface col-span-12 overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center border-b border-outline-variant">
            <div>
              <h4 className="font-headline-md text-headline-md">Top Products by Inventory Value</h4>
              <p className="text-sm text-on-surface-variant mt-1">
                Price × stock on hand — highest tied-up value first
              </p>
            </div>
            <Link className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1" href="/admin/products">
              View all inventory
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                    Price
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                    Inventory
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                    Inventory Value
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4" colSpan={6}>
                        <div className="h-12 bg-surface-container-low animate-pulse rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : topProducts.length === 0 ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-on-surface-variant" colSpan={6}>
                      No products yet — add products to see them ranked here.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product) => {
                    const stock = stockBadge(product.inventory);
                    return (
                      <tr key={product._id} className="hover:bg-surface-container-low transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg bg-surface-container-highest overflow-hidden shadow-sm shrink-0">
                              <Image
                                className="object-cover"
                                alt={product.title}
                                src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'}
                                fill
                                sizes="48px"
                              />
                            </div>
                            <div>
                              <p className="font-body-md text-body-md font-bold">{product.title}</p>
                              <p className="text-[11px] text-on-surface-variant">{product.productType || 'General'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">
                          <span className="bg-surface-container px-2 py-1 rounded text-xs">{product.SKU || '—'}</span>
                        </td>
                        <td className="px-6 py-4 font-body-sm text-body-sm text-right font-bold">{PKR(product.price)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-[10px] font-bold ${stock.className}`}>
                            {product.inventory} · {stock.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-body-md text-body-md text-right font-bold">{PKR(product.inventoryValue)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-[10px] font-bold ${statusBadge(product.status)}`}>
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AnalyticsPage;
