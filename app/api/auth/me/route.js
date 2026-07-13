import { NextResponse } from 'next/server';
import { verifyCustomerToken } from '@/lib/auth';
import { findCustomerByEmail, sanitizeCustomer } from '@/lib/customerAuth';

// Return the currently authenticated customer (from the customer_token cookie),
// re-read fresh from Sanity so profile edits are reflected immediately.
export async function GET(request) {
  const auth = verifyCustomerToken(request);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const customer = await findCustomerByEmail(auth.customer.email);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, customer: sanitizeCustomer(customer) }, { status: 200 });
  } catch (error) {
    console.error('Fetch current customer error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
