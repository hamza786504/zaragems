import { NextResponse } from 'next/server';
import { findByCredentials, signCustomerToken, sessionCookie, sanitizeCustomer } from '@/lib/customerAuth';

// Authenticate a storefront customer by email + password and set customer_token.
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let customer;
    try {
      customer = await findByCredentials(email, password);
    } catch (error) {
      if (error.message.includes('locked')) {
        return NextResponse.json({ success: false, error: error.message }, { status: 423 });
      }
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'No account found for this email. Please register.' },
        { status: 401 }
      );
    }

    const token = signCustomerToken(customer);

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Login successful',
        customer: sanitizeCustomer(customer),
      }),
      {
        status: 200,
        headers: {
          'Set-Cookie': sessionCookie(token),
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
