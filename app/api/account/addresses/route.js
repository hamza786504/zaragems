import { NextResponse } from 'next/server';
import crypto from 'crypto';
import client from '@/lib/sanityClient';
import { withCustomerAuth } from '@/lib/auth';
import { findCustomerByEmail } from '@/lib/customerAuth';

const FIELDS = ['firstName', 'lastName', 'street', 'apartment', 'city', 'country', 'postalCode', 'phone'];

function pickAddress(body) {
  const addr = {};
  for (const f of FIELDS) addr[f] = typeof body[f] === 'string' ? body[f] : '';
  addr.isDefault = !!body.isDefault;
  return addr;
}

async function getCustomerOr404(email) {
  const customer = await findCustomerByEmail(email);
  return customer;
}

// GET — list the customer's saved addresses.
export const GET = withCustomerAuth(async (request) => {
  const customer = await getCustomerOr404(request.customer.email);
  if (!customer) return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
  return NextResponse.json({ success: true, addresses: customer.addresses || [] }, { status: 200 });
});

// POST — add a new address.
export const POST = withCustomerAuth(async (request) => {
  try {
    const body = await request.json();
    const customer = await getCustomerOr404(request.customer.email);
    if (!customer) return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });

    const newAddr = { _key: crypto.randomUUID(), ...pickAddress(body) };
    let addresses = [...(customer.addresses || []), newAddr];
    // First address is always default; honour an explicit default too.
    if (newAddr.isDefault || addresses.length === 1) {
      addresses = addresses.map((a) => ({ ...a, isDefault: a._key === newAddr._key }));
    }

    await client.patch(customer._id).set({ addresses }).commit();
    return NextResponse.json({ success: true, addresses }, { status: 201 });
  } catch (error) {
    console.error('Add address error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

// PUT — update an existing address by _key.
export const PUT = withCustomerAuth(async (request) => {
  try {
    const body = await request.json();
    if (!body._key) return NextResponse.json({ success: false, error: 'Address key required' }, { status: 400 });

    const customer = await getCustomerOr404(request.customer.email);
    if (!customer) return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });

    const updated = pickAddress(body);
    let addresses = (customer.addresses || []).map((a) =>
      a._key === body._key ? { ...a, ...updated, _key: a._key } : a
    );
    if (updated.isDefault) {
      addresses = addresses.map((a) => ({ ...a, isDefault: a._key === body._key }));
    }

    await client.patch(customer._id).set({ addresses }).commit();
    return NextResponse.json({ success: true, addresses }, { status: 200 });
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

// DELETE — remove an address by _key (?key= or JSON body).
export const DELETE = withCustomerAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    let key = searchParams.get('key');
    if (!key) {
      const body = await request.json().catch(() => ({}));
      key = body._key;
    }
    if (!key) return NextResponse.json({ success: false, error: 'Address key required' }, { status: 400 });

    const customer = await getCustomerOr404(request.customer.email);
    if (!customer) return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });

    let addresses = (customer.addresses || []).filter((a) => a._key !== key);
    // Keep a default if we removed the default one.
    if (addresses.length && !addresses.some((a) => a.isDefault)) {
      addresses = addresses.map((a, i) => ({ ...a, isDefault: i === 0 }));
    }

    await client.patch(customer._id).set({ addresses }).commit();
    return NextResponse.json({ success: true, addresses }, { status: 200 });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
