import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';
import { withTimestamps } from '@/lib/sanityHelpers';

const ORDER_PROJECTION = `{
  ...,
  "createdAt": _createdAt,
  "updatedAt": _updatedAt
}`;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const fulfillmentStatus = searchParams.get('fulfillmentStatus') || '';
    const orderStatus = searchParams.get('orderStatus') || 'active';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const conditions = ['_type == "order"'];
    const params = {};

    if (search) {
      conditions.push('(orderId match $search || customer.name match $search || customer.email match $search)');
      params.search = `*${search}*`;
    }

    if (paymentStatus && paymentStatus !== 'All') {
      conditions.push('paymentStatus == $paymentStatus');
      params.paymentStatus = paymentStatus;
    }

    if (fulfillmentStatus && fulfillmentStatus !== 'All') {
      conditions.push('fulfillmentStatus == $fulfillmentStatus');
      params.fulfillmentStatus = fulfillmentStatus;
    }

    if (orderStatus && orderStatus !== 'All') {
      conditions.push('status == $orderStatus');
      params.orderStatus = orderStatus;
    }

    const filterStr = conditions.join(' && ');
    const totalOrders = await client.fetch(`count(*[${filterStr}])`, params);
    const totalPages = Math.ceil(totalOrders / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    const orders = await client.fetch(
      `*[${filterStr}] | order(date desc) [${start}...${end}]${ORDER_PROJECTION}`,
      params
    );

    return NextResponse.json(
      { success: true, orders, totalOrders, totalPages, currentPage: page },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Auto-generate orderId if not provided
    if (!body.orderId) {
      body.orderId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36).toUpperCase()}`;
    }

    // `date` (not Sanity's immutable _createdAt) is the source of truth for order
    // chronology, since it's the one field that can be backdated (used by /api/seed).
    if (!body.date) {
      body.date = new Date().toISOString();
    }

    const order = await client.create({ _type: 'order', status: 'active', ...body });

    // Upsert customer profile
    if (body.customer?.email) {
      const email = body.customer.email.toLowerCase();
      const nameParts = (body.customer.name || '').split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || '';
      const address = [body.address, body.apartment, body.city, body.country].filter(Boolean).join(', ');

      const existingCustomer = await client.fetch(`*[_type == "customer" && email == $email][0]{_id}`, { email });

      if (existingCustomer) {
        await client
          .patch(existingCustomer._id)
          .set({ phone: body.phone || '', address })
          .inc({ ordersCount: 1, totalSpent: body.total || 0 })
          .commit();
      } else {
        await client.create({
          _type: 'customer',
          firstName,
          lastName,
          email,
          status: 'active',
          phone: body.phone || '',
          address,
          ordersCount: 1,
          totalSpent: body.total || 0,
        });
      }
    }

    // Create admin notification for the new order
    try {
      const customerName = body.customer?.name || 'A customer';
      const orderTotal = body.total ? `Rs. ${Number(body.total).toLocaleString()}` : '';
      await client.create({
        _type: 'notification',
        type: 'new_order',
        title: `New order ${order.orderId}`,
        message: `${customerName} placed an order${orderTotal ? ` for ${orderTotal}` : ''}.`,
        link: `/admin/orders/order-details?id=${order._id}`,
        isRead: false,
        metadata: {
          orderId: order.orderId,
          customerName: body.customer?.name,
          customerEmail: body.customer?.email,
          total: body.total,
          items: body.items,
        },
      });
    } catch (notifErr) {
      // Non-critical — log but don't fail the order creation
      console.error('Failed to create order notification:', notifErr);
    }

    return NextResponse.json({ success: true, order: withTimestamps(order) }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.ids && Array.isArray(body.ids)) {
      const tx = client.transaction();
      body.ids.forEach((id) => tx.delete(id));
      await tx.commit();
      return NextResponse.json(
        { success: true, message: `${body.ids.length} orders deleted successfully` },
        { status: 200 }
      );
    }
    return NextResponse.json({ success: false, message: 'No order IDs provided' }, { status: 400 });
  } catch (error) {
    console.error('Error in bulk delete orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.ids && Array.isArray(body.ids)) {
      const { status, paymentStatus, fulfillmentStatus } = body;
      const updateData = {};
      if (status) updateData.status = status;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (fulfillmentStatus) updateData.fulfillmentStatus = fulfillmentStatus;

      const tx = client.transaction();
      body.ids.forEach((id) => tx.patch(id, { set: updateData }));
      await tx.commit();

      return NextResponse.json(
        { success: true, message: `${body.ids.length} orders updated successfully` },
        { status: 200 }
      );
    }
    return NextResponse.json({ success: false, message: 'No order IDs provided' }, { status: 400 });
  } catch (error) {
    console.error('Error in bulk update orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
