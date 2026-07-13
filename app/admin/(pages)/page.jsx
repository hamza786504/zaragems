// app/admin/page.jsx
// Single-fetch dashboard: data is fetched ONCE on the server, then passed
// as props to each slot's client component. No more 8 separate HTTP requests.

import { headers } from 'next/headers';
import SeedButton from './SeedButton';
import MetricCardsClient from './@metrics/MetricCardsClient';
import SalesTrendClient from './@salesTrend/SalesTrendClient';
import RecentOrdersClient from './@recentOrders/RecentOrdersClient';
import CollectionsClient from './@collections/CollectionsClient';
import OrderStatusClient from './@orderStatus/OrderStatusClient';
import LowStockClient from './@lowStock/LowStockClient';
import RecentCustomersClient from './@recentCustomers/RecentCustomersClient';
import DbOverviewClient from './@dbOverview/DbOverviewClient';

const PKR = (val) => `Rs ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

async function fetchDashboardStats() {
  try {
    // Resolve the origin from the incoming request so the self-fetch always
    // hits THIS app's server, regardless of which port it runs on (3000, 3001, …)
    // or whether it's behind a proxy. Avoids hardcoding localhost:3000, which can
    // point at a different app running on that port.
    const h = await headers();
    const host = h.get('host') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const protocol = h.get('x-forwarded-proto') || (host.startsWith('https') ? 'https' : 'http');
    const base = host.startsWith('http') ? host : `${protocol}://${host}`;
    const res = await fetch(`${base}/api/dashboard/stats`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data : null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  // ─── SINGLE FETCH: all stats in one API call ───
  const data = await fetchDashboardStats();

  const m = data?.metrics || {};
  const spark = data?.salesTrendData || [];
  const salesTrendData = data?.salesTrendData || [];
  const recentOrders = data?.recentOrders || [];
  const categoryData = data?.categoryData && data.categoryData.length > 0
    ? data.categoryData
    : [{ name: 'No Products', value: 1, color: '#e1e3e5' }];
  const orderStatusBreakdown = data?.orderStatusBreakdown || {};
  const fulfillmentBreakdown = data?.fulfillmentBreakdown || {};
  const ordersCount = m.ordersCount || 0;
  const lowStockProducts = data?.lowStockProducts || [];
  const recentCustomers = data?.recentCustomers || [];
  const productStatusBreakdown = data?.productStatusBreakdown || {};

  const metricCards = [
    {
      title: 'Total Revenue',
      value: PKR(m.totalSales || 0),
      subtitle: `${PKR(m.currentPeriodSales || 0)} last 30 days`,
      change: m.salesChange || 0,
      positive: (m.salesChange || 0) >= 0,
      iconKey: 'dollar',
      bgColor: 'bg-primary-container/10',
      textColor: 'text-primary',
      sparkData: spark,
    },
    {
      title: 'Total Orders',
      value: (m.ordersCount || 0).toLocaleString(),
      subtitle: `Avg order: ${PKR(m.avgOrderValue || 0)}`,
      change: m.ordersChange || 0,
      positive: (m.ordersChange || 0) >= 0,
      iconKey: 'cart',
      bgColor: 'bg-tertiary-container/10',
      textColor: 'text-tertiary',
      sparkData: spark,
    },
    {
      title: 'Customers',
      value: (m.customersCount || 0).toLocaleString(),
      subtitle: `${m.newCustomersCurrent || 0} new this month`,
      change: m.customersChange || 0,
      positive: (m.customersChange || 0) >= 0,
      iconKey: 'users',
      bgColor: 'bg-secondary-container/30',
      textColor: 'text-secondary',
      sparkData: spark,
    },
    {
      title: 'Avg Order Value',
      value: PKR(m.avgOrderValue || 0),
      subtitle: `From ${m.ordersCount || 0} orders`,
      change: m.avgOrderChange || 0,
      positive: (m.avgOrderChange || 0) >= 0,
      iconKey: 'click',
      bgColor: 'bg-primary-fixed/30',
      textColor: 'text-primary',
      sparkData: spark,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-lg">
      {/* Header with Quick Actions */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-headline-lg text-headline-lg text-on-surface">
              Dashboard Overview
            </h3>
            <span className="inline-flex items-center px-2 py-1 rounded bg-success-container/20 text-success text-[10px] font-bold uppercase tracking-wider animate-pulse">
              Live
            </span>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Real-time stats from your MongoDB database. Single optimized query.
          </p>
        </div>
        {/* <SeedButton /> */}
      </div>

      {/* ─── All slots rendered with pre-fetched data (no extra HTTP calls) ─── */}
      <MetricCardsClient cards={metricCards} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-sm">
        <SalesTrendClient salesTrendData={salesTrendData} />
        <RecentOrdersClient recentOrders={recentOrders} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <CollectionsClient categoryData={categoryData} />
        <OrderStatusClient orderStatusBreakdown={orderStatusBreakdown} fulfillmentBreakdown={fulfillmentBreakdown} ordersCount={ordersCount} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <LowStockClient lowStockProducts={lowStockProducts} />
        <RecentCustomersClient recentCustomers={recentCustomers} />
        <DbOverviewClient metrics={m} productStatusBreakdown={productStatusBreakdown} />
      </div>
    </div>
  );
}