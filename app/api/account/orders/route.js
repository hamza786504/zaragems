import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';
import { withCustomerAuth } from '@/lib/auth';

// GET /api/account/orders — orders belonging to the logged-in customer,
// matched by the email stored on each order (order.customer.email).
export const GET = withCustomerAuth(async (request) => {
  try {
    const email = request.customer.email.toLowerCase();
    const orders = await client.fetch(
      `*[_type == "order" && lower(customer.email) == $email] | order(date desc){
        _id,
        orderId,
        date,
        total,
        items,
        status,
        paymentStatus,
        fulfillmentStatus,
        lineItems,
        "createdAt": _createdAt
      }`,
      { email }
    );

    return NextResponse.json({ success: true, orders: orders || [] }, { status: 200 });
  } catch (error) {
    console.error('Get customer orders error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
