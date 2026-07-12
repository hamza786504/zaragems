import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';

function groupCount(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || 'Unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const prevThirtyDaysAgo = new Date(thirtyDaysAgo);
    prevThirtyDaysAgo.setDate(prevThirtyDaysAgo.getDate() - 30);

    // ─── Fetch raw data in PARALLEL (GROQ has no aggregation pipeline, so
    // grouping/summing happens in JS below, same as the old Mongo pipelines) ───
    const [allOrders, allProducts, allCustomers, reviewsCount, recentCustomers, recentOrders, collections] =
      await Promise.all([
        client.fetch(`*[_type == "order"]{ _id, total, paymentStatus, fulfillmentStatus, date, "createdAt": _createdAt }`),
        client.fetch(
          `*[_type == "product"]{ _id, title, slug, images, SKU, productType, price, inventory, status, collectionId }`
        ),
        client.fetch(`*[_type == "customer"]{ "createdAt": _createdAt }`),
        client.fetch(`count(*[_type == "review"])`),
        client.fetch(
          `*[_type == "customer"] | order(_createdAt desc) [0...5]{ firstName, lastName, email, "createdAt": _createdAt, ordersCount, totalSpent }`
        ),
        client.fetch(`*[_type == "order"] | order(date desc) [0...6]{ ..., "createdAt": _createdAt, "updatedAt": _updatedAt }`),
        client.fetch(`*[_type == "collection"]{ _id, name }`),
      ]);

    const productsCount = allProducts.length;
    const customersCount = allCustomers.length;
    const ordersCount = allOrders.length;

    // ─── Orders-derived metrics ───
    const totalSales = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const currentPeriodOrders = allOrders.filter((o) => new Date(o.date) >= thirtyDaysAgo);
    const prevPeriodOrders = allOrders.filter(
      (o) => new Date(o.date) >= prevThirtyDaysAgo && new Date(o.date) < thirtyDaysAgo
    );
    const currentSales = currentPeriodOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const currentOrders = currentPeriodOrders.length;
    const prevSales = prevPeriodOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const prevOrders = prevPeriodOrders.length;

    const newCustomersCurrent = allCustomers.filter((c) => new Date(c.createdAt) >= thirtyDaysAgo).length;
    const newCustomersPrev = allCustomers.filter(
      (c) => new Date(c.createdAt) >= prevThirtyDaysAgo && new Date(c.createdAt) < thirtyDaysAgo
    ).length;

    const orderStatusBreakdown = groupCount(allOrders, 'paymentStatus');
    const fulfillmentBreakdown = groupCount(allOrders, 'fulfillmentStatus');
    const productStatusBreakdown = groupCount(allProducts, 'status');

    const revenueByStatusMap = allOrders.reduce((acc, o) => {
      const status = o.paymentStatus || 'Unknown';
      if (!acc[status]) acc[status] = { status, revenue: 0, count: 0 };
      acc[status].revenue += o.total || 0;
      acc[status].count += 1;
      return acc;
    }, {});
    const revenueByStatus = Object.values(revenueByStatusMap);

    // Only products with *tracked* inventory (non-null number) can be low/out-of-stock.
    // Untracked products (inventory === null) are always purchasable — exclude them.
    const LOW_STOCK_THRESHOLD = 5;
    const lowStockAll = allProducts
      .filter((p) => p.inventory !== null && p.inventory !== undefined && p.inventory <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.inventory - b.inventory);
    const lowStockProducts = lowStockAll
      .slice(0, 5)
      .map((p) => ({ _id: p._id, title: p.title, inventory: p.inventory, slug: p.slug }));
    const lowStockCount = lowStockAll.length;

    // Only count tracked inventory in total (untracked = null → skip)
    const totalInventory = allProducts.reduce((sum, p) => sum + (typeof p.inventory === 'number' ? p.inventory : 0), 0);
    const pricedProducts = allProducts.filter((p) => typeof p.price === 'number');
    const avgPrice = pricedProducts.length
      ? pricedProducts.reduce((sum, p) => sum + p.price, 0) / pricedProducts.length
      : 0;

    const productsByCollectionMap = allProducts.reduce((acc, p) => {
      const key = p.collectionId || 'unassigned';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // inventoryValue: only meaningful for tracked products
    const topProductsByValue = [...allProducts]
      .filter((p) => typeof p.inventory === 'number')
      .map((p) => ({ ...p, inventoryValue: (p.price || 0) * p.inventory }))
      .sort((a, b) => b.inventoryValue - a.inventoryValue)
      .slice(0, 5);

    // ─── Derived percentage changes ───
    const salesChange =
      prevSales > 0 ? (((currentSales - prevSales) / prevSales) * 100).toFixed(1) : currentSales > 0 ? 100 : 0;
    const ordersChange =
      prevOrders > 0 ? (((currentOrders - prevOrders) / prevOrders) * 100).toFixed(1) : currentOrders > 0 ? 100 : 0;
    const customersChange =
      newCustomersPrev > 0
        ? (((newCustomersCurrent - newCustomersPrev) / newCustomersPrev) * 100).toFixed(1)
        : newCustomersCurrent > 0
        ? 100
        : 0;

    const avgOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0;
    const currentAvgOrderValue = currentOrders > 0 ? currentSales / currentOrders : 0;
    const prevAvgOrderValue = prevOrders > 0 ? prevSales / prevOrders : 0;
    const avgOrderChange =
      prevAvgOrderValue > 0
        ? (((currentAvgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100).toFixed(1)
        : currentAvgOrderValue > 0
        ? 100
        : 0;

    // Build category data from products-by-collection + collections lookup
    const colors = ['#006c50', '#5d5e60', '#8f3f37', '#bdc9c2', '#e1e3e5'];
    const collectionMap = {};
    for (const coll of collections) collectionMap[coll._id] = coll;

    const categoryData = [];
    for (const [collId, count] of Object.entries(productsByCollectionMap)) {
      if (collId === 'unassigned') {
        categoryData.push({ name: 'Unassigned', value: count, color: '#bdbdbd' });
      } else {
        const coll = collectionMap[collId];
        if (coll) {
          categoryData.push({ name: coll.name, value: count, color: colors[categoryData.length % colors.length] });
        }
      }
    }

    // Sales trend (last 15 days, fill gaps for days with no orders)
    const salesTrend = [];
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const isoDate = date.toISOString().slice(0, 10);
      const dayOrders = allOrders.filter((o) => o.date?.slice(0, 10) === isoDate);
      salesTrend.push({
        date: dateStr,
        sales: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        orders: dayOrders.length,
      });
    }

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const year = monthStart.getFullYear();
      const month = monthStart.getMonth();
      const monthOrders = allOrders.filter((o) => {
        const d = new Date(o.date);
        return d.getFullYear() === year && d.getMonth() === month;
      });
      monthlyRevenue.push({
        month: monthLabel,
        revenue: monthOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        orders: monthOrders.length,
      });
    }

    return NextResponse.json(
      {
        success: true,
        metrics: {
          totalSales,
          ordersCount,
          productsCount,
          customersCount,
          reviewsCount,
          avgOrderValue,
          currentPeriodSales: currentSales,
          newCustomersCurrent,
          salesChange: parseFloat(salesChange),
          ordersChange: parseFloat(ordersChange),
          customersChange: parseFloat(customersChange),
          avgOrderChange: parseFloat(avgOrderChange),
        },
        orderStatusBreakdown,
        fulfillmentBreakdown,
        productStatusBreakdown,
        revenueByStatus,
        lowStockProducts,
        lowStockCount,
        topProductsByValue,
        recentCustomers,
        recentOrders,
        categoryData,
        salesTrendData: salesTrend,
        monthlyRevenue,
        totalInventory,
        avgPrice,
        lastUpdated: now.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
