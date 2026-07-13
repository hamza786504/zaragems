import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';
import {
  hashPassword,
  findCustomerByEmail,
  signCustomerToken,
  sessionCookie,
  sanitizeCustomer,
} from '@/lib/customerAuth';

// Register a storefront customer account and log them in (sets customer_token).
// If a guest `customer` doc already exists for this email (created by a prior
// order) but has no password, we "claim" it by setting the password rather than
// creating a duplicate. If it already has a password, we ask them to log in.
export async function POST(request) {
  try {
    const { firstName, lastName, email, password, phone } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'First name, last name, email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();
    const hashedPassword = await hashPassword(password);
    const existing = await findCustomerByEmail(emailLower);

    let customer;
    if (existing) {
      if (existing.password) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists. Please log in.' },
          { status: 409 }
        );
      }
      // Claim the guest customer record with credentials.
      customer = await client
        .patch(existing._id)
        .set({
          password: hashedPassword,
          firstName,
          lastName,
          phone: phone || existing.phone || '',
          loginAttempts: 0,
          lockUntil: null,
          lastLogin: new Date().toISOString(),
        })
        .commit();
      customer = { ...existing, ...customer };
    } else {
      customer = await client.create({
        _type: 'customer',
        firstName,
        lastName,
        email: emailLower,
        password: hashedPassword,
        phone: phone || '',
        status: 'active',
        ordersCount: 0,
        totalSpent: 0,
        addresses: [],
        loginAttempts: 0,
        lockUntil: null,
        lastLogin: new Date().toISOString(),
      });
    }

    const token = signCustomerToken({ ...customer, email: emailLower });

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Account created successfully',
        customer: sanitizeCustomer({ ...customer, email: emailLower }),
      }),
      {
        status: 201,
        headers: {
          'Set-Cookie': sessionCookie(token),
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Customer registration error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
