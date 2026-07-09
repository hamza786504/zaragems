import OrderStatusClient from './OrderStatusClient';

async function fetchStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dashboard/stats`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data : null;
  } catch {
    return null;
  }
}

export default async function OrderStatusSlot() {
  const data = await fetchStats();
  return (
    <OrderStatusClient
      orderStatusBreakdown={data?.orderStatusBreakdown || {}}
      fulfillmentBreakdown={data?.fulfillmentBreakdown || {}}
      ordersCount={data?.metrics?.ordersCount || 0}
    />
  );
}
