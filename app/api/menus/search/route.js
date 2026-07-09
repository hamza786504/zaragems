import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';

// Static pages list — extend as needed
const STATIC_PAGES = [
  { label: 'Home',        url: '/',              slug: ''          },
  { label: 'About',       url: '/about',         slug: 'about'     },
  { label: 'Contact',     url: '/contact',       slug: 'contact'   },
  { label: 'Shop All',    url: '/collection/all',slug: 'all'       },
  { label: 'New Arrivals',url: '/collection/new-arrivals', slug: 'new-arrivals' },
  { label: 'Cart',        url: '/cart',          slug: 'cart'      },
  { label: 'Login',       url: '/login',         slug: 'login'     },
  { label: 'FAQ',         url: '/pages/faq',     slug: 'faq'       },
  { label: 'Privacy Policy', url: '/pages/privacy', slug: 'privacy' },
  { label: 'Terms',       url: '/pages/terms',   slug: 'terms'     },
];

// GET /api/menus/search?q=keyword
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q || q.length < 1) {
      return NextResponse.json({ success: true, results: [] }, { status: 200 });
    }

    const wildcard = `*${q}*`;

    // Run both in parallel
    const [products, collections] = await Promise.all([
      client.fetch(
        `*[_type == "product" && title match $wildcard && status == "active"][0...5]{ _id, title, slug }`,
        { wildcard }
      ),
      client.fetch(
        `*[_type == "collection" && (name match $wildcard || slug match $wildcard)][0...5]{ _id, name, slug }`,
        { wildcard }
      ),
    ]);

    // Match static pages
    const pageResults = STATIC_PAGES.filter(
      (p) =>
        p.label.toLowerCase().includes(q.toLowerCase()) ||
        p.slug.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 4);

    const results = [
      ...products.map((p) => ({
        type: 'product',
        label: p.title,
        url: `/product/${p.slug || p._id}`,
        slug: p.slug || String(p._id),
        id: String(p._id),
      })),
      ...collections.map((c) => ({
        type: 'collection',
        label: c.name,
        url: `/collection/${c.slug}`,
        slug: c.slug,
        id: String(c._id),
      })),
      ...pageResults.map((p) => ({
        type: 'page',
        label: p.label,
        url: p.url,
        slug: p.slug,
        id: p.slug,
      })),
    ];

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (error) {
    console.error('Menu search error:', error);
    return NextResponse.json({ success: false, results: [], error: error.message }, { status: 500 });
  }
}
