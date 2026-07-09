import CollectionsClient from './CollectionsClient';

async function fetchStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dashboard/stats`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data : null;
  } catch {
    return null;
  }
}

export default async function CollectionsSlot() {
  const data = await fetchStats();
  const categoryData = data?.categoryData && data.categoryData.length > 0
    ? data.categoryData
    : [{ name: 'No Products', value: 1, color: '#e1e3e5' }];
  return <CollectionsClient categoryData={categoryData} />;
}
