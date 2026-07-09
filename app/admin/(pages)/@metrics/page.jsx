import MetricCardsClient from './MetricCardsClient';

const PKR = (val) => `Rs ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

async function fetchMetrics() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dashboard/stats`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data : null;
  } catch {
    return null;
  }
}

export default async function MetricsSlot() {
  const data = await fetchMetrics();
  const m = data?.metrics || {};
  const spark = data?.salesTrendData || [];

  const cards = [
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

  return <MetricCardsClient cards={cards} />;
}
