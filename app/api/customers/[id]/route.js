import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';

const CUSTOMER_PROJECTION = `{
  ...,
  "createdAt": _createdAt,
  "updatedAt": _updatedAt
}`;

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const customer = await client.fetch(`*[_type == "customer" && _id == $id][0]${CUSTOMER_PROJECTION}`, { id });

    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer }, { status: 200 });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await client.fetch(`*[_type == "customer" && _id == $id][0]{_id}`, { id });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    if (body.email) {
      body.email = body.email.toLowerCase();
      const clash = await client.fetch(
        `*[_type == "customer" && _id != $id && email == $email][0]{_id}`,
        { id, email: body.email }
      );
      if (clash) {
        return NextResponse.json(
          { success: false, error: 'A customer with this email already exists' },
          { status: 400 }
        );
      }
    }

    await client.patch(id).set(body).commit();
    const customer = await client.fetch(`*[_type == "customer" && _id == $id][0]${CUSTOMER_PROJECTION}`, { id });

    return NextResponse.json({ success: true, customer }, { status: 200 });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const existing = await client.fetch(`*[_type == "customer" && _id == $id][0]{_id}`, { id });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    await client.delete(id);

    return NextResponse.json({ success: true, message: 'Customer deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
