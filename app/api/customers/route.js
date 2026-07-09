import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';
import { withTimestamps } from '@/lib/sanityHelpers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';

    const conditions = ['_type == "customer"'];
    const params = {};

    if (search) {
      conditions.push(
        '(firstName match $search || lastName match $search || email match $search || phone match $search)'
      );
      params.search = `*${search}*`;
    }

    if (status && status !== 'All Statuses') {
      conditions.push('status == $status');
      params.status = status.toLowerCase();
    }

    const customers = await client.fetch(
      `*[${conditions.join(' && ')}] | order(_createdAt desc){
        ...,
        "createdAt": _createdAt,
        "updatedAt": _updatedAt
      }`,
      params
    );

    return NextResponse.json({ success: true, customers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.email) {
      body.email = body.email.toLowerCase();
      const existing = await client.fetch(`*[_type == "customer" && email == $email][0]{_id}`, {
        email: body.email,
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'A customer with this email already exists' },
          { status: 400 }
        );
      }
    }

    const created = await client.create({ _type: 'customer', status: 'active', ordersCount: 0, totalSpent: 0, ...body });
    return NextResponse.json({ success: true, customer: withTimestamps(created) }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No customer IDs provided' }, { status: 400 });
    }

    const tx = client.transaction();
    ids.forEach((id) => tx.delete(id));
    await tx.commit();

    return NextResponse.json({ success: true, message: `${ids.length} customers deleted successfully` }, { status: 200 });
  } catch (error) {
    console.error('Error deleting customers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
