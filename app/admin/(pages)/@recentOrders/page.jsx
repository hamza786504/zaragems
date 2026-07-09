import RecentOrdersClient from './RecentOrdersClient';

async function fetchStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dashboard/stats`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data : null;
  } catch {
    return null;
  }
}

export default async function RecentOrdersSlot() {
  const data = await fetchStats();
  const recentOrders = data?.recentOrders || [];
  return <RecentOrdersClient recentOrders={recentOrders} />;
}
