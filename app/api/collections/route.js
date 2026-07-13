import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';
import { withTimestamps } from '@/lib/sanityHelpers';
import { slugify } from '@/lib/slugify';

export async function GET() {
  try {
    const collections = await client.fetch(
      `*[_type == "collection"] | order(name asc){
        ...,
        "createdAt": _createdAt,
        "updatedAt": _updatedAt,
        "productCount": count(*[_type == "product" && collectionId == ^._id])
      }`
    );
    return NextResponse.json({ success: true, collections }, { status: 200 });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.slug) {
      body.slug = slugify(body.slug);
    } else if (body.name) {
      body.slug = slugify(body.name);
    }

    const clash = await client.fetch(
      `*[_type == "collection" && (name == $name || slug == $slug)][0]{_id}`,
      { name: body.name, slug: body.slug }
    );
    if (clash) {
      return NextResponse.json(
        { success: false, error: 'A collection with this name or slug already exists' },
        { status: 400 }
      );
    }

    const created = await client.create({ _type: 'collection', ...body });
    return NextResponse.json({ success: true, collection: withTimestamps(created) }, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
