import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';
import { withCustomerAuth } from '@/lib/auth';
import {
  findCustomerByEmail,
  sanitizeCustomer,
  hashPassword,
  comparePassword,
} from '@/lib/customerAuth';

// GET /api/account/profile — current customer profile
export const GET = withCustomerAuth(async (request) => {
  try {
    const customer = await findCustomerByEmail(request.customer.email);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, customer: sanitizeCustomer(customer) }, { status: 200 });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

// PUT /api/account/profile — update name/phone and optionally change password.
export const PUT = withCustomerAuth(async (request) => {
  try {
    const body = await request.json();
    const customer = await findCustomerByEmail(request.customer.email);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }

    const set = {};
    if (typeof body.firstName === 'string') set.firstName = body.firstName;
    if (typeof body.lastName === 'string') set.lastName = body.lastName;
    if (typeof body.phone === 'string') set.phone = body.phone;

    // Password change requires the current password to match.
    if (body.newPassword) {
      if (body.newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters long' },
          { status: 400 }
        );
      }
      if (!customer.password) {
        return NextResponse.json(
          { success: false, error: 'No password is set on this account' },
          { status: 400 }
        );
      }
      const valid = await comparePassword(body.currentPassword || '', customer.password);
      if (!valid) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
      }
      set.password = await hashPassword(body.newPassword);
    }

    const updated = await client.patch(customer._id).set(set).commit();
    return NextResponse.json(
      { success: true, customer: sanitizeCustomer({ ...customer, ...updated }) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
