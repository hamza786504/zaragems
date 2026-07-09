import { NextResponse } from 'next/server';
import client from '@/lib/sanityClient';
import productsJson from '@/app/data/products.json';

export async function POST() {
  try {
    // 1. Clear existing data
    await client.delete({
      query: '*[_type in ["collection", "product", "customer", "review", "order", "menu"]]',
    });

    // 2. Create Collections matching the frontend fabrics
    const collectionsData = [
      {
        name: 'Organza',
        description: 'Pure Silk Organza and Silk Mix Organza ensembles with intricate hand-crafted embroidery.',
        slug: 'organza',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoGuvIATCRYdiSHr8pz9rI15ZgsYXb0xNptS1Tpt7MLz5IhmPRQ8ZnnnphjM0XQhDv0JjLrPuj1smXO5LUXkhXfaGCykKF4TC1tV-VmoQ1RawdJqMJ0wXEv51b14P2y3-rAXttR0sWc9gblewBQ_c6WC5zeULQE2qop251RKBb0N7ZTd4UzzB2_VCvet_gMbqluwGEk6PoO6x6DjA9BrKvH7zUz50eJ5je5nKNxEoL7-jPkYIwU7TToAn5tfOz2u9hXk1fukpQ8KRz',
      },
      {
        name: 'Chiffon',
        description: 'Premium and Luxury Chiffon collections for festive and formal occasions.',
        slug: 'chiffon',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk0iVyN-mJqdWuDMX-N55lGe-155pw9Td_5pn3BH2ZE5r2G5oLv_pBDMsia8qxiKmWEzaWr61ZWKUpjb6SVsWkU_mUP2Hxq8BhPiPKR1JNQnijpEx7x5TqXGZoGrDgL96UcI50KQkhzHukGoSCYEvXhv8NI0ePbfyikYcFlyOScmyH20ddxtcX2-h7TQPPr2l7gm9d99bq8BzDBTaFvmjSnkwXI_rNUbbhSMUrNNzrTYM1-kdepwt3l6qUZ7QMNR2aerHUT-AizE--',
      },
      {
        name: 'Lawn',
        description: 'Egyptian Cotton Lawn, Fine Lawn and Pure Lawn suits for everyday premium wear.',
        slug: 'lawn',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyLOHDBNpP7YCqdArthP3y-9RFMlF9VkY6q47kAoYefVCPoJTce2-diuJACKHFhQ9cbky8Frf1RpjrMUJQyWLIn8IhspwFniykFlcAPkpIthKUzlA6VDdtngwuVmm9jsnbSD_ZI052H3ZBXDPXg3uRtF-yi8R5a6RaTnGGRs05KYJck2HHWMMRclg2z71VWPGaNjSiQ9mvJNzqsRpV55RCd0zBnTmzQdSxyNTo978SW7jwc_g1eE6zr1jH8EMzHEVXareX_CU2zEZ5',
      },
    ];

    const collections = await Promise.all(
      collectionsData.map((doc) => client.create({ _type: 'collection', ...doc }))
    );
    const colBySlug = {};
    for (const col of collections) colBySlug[col.slug] = col;

    // 3. Seed Products from products.json
    const productsData = productsJson
      .filter((p) => !p.isAccessory) // skip accessories that don't map to a fabric collection
      .map((p) => {
        const fabricSlug = (p.fabric || '').toLowerCase();
        const collection = colBySlug[fabricSlug] || null;
        return {
          title: p.title,
          slug: p.slug,
          description: p.description || '',
          images: [p.primaryImage || p.image, ...(p.thumbnails || [])].filter(Boolean),
          price: p.priceNumeric || 0,
          status: p.badge === 'Sold Out' ? 'draft' : 'active',
          collectionId: collection ? collection._id : null,
          vendor: 'Zaragems',
          productType: p.fabric || 'General',
          sizes: p.sizes || [],
          colors: p.colors || [],
          variants: (p.sizes || ['One Size']).map((size) => ({
            size,
            color: (p.colors || ['Default'])[0],
            inventory: 10,
            price: p.priceNumeric || 0,
          })),
          inventory: p.badge === 'Sold Out' ? 0 : 25,
        };
      });

    const products = await Promise.all(productsData.map((doc) => client.create({ _type: 'product', ...doc })));
    const firstProduct = products[0];
    const secondProduct = products[1] || products[0];

    // 4. Create Customers
    const customersData = [
      { firstName: 'Ayesha', lastName: 'Khan', email: 'ayesha.k@example.com', phone: '+92 321 1234567', status: 'active', address: 'House 12, DHA Phase 5, Lahore', ordersCount: 3, totalSpent: 62500 },
      { firstName: 'Zainab', lastName: 'Malik', email: 'zainab.m@example.com', phone: '+92 333 9876543', status: 'active', address: 'Flat 5B, Gulshan-e-Iqbal, Karachi', ordersCount: 2, totalSpent: 45000 },
      { firstName: 'Sara', lastName: 'Ahmed', email: 'sara.a@example.com', phone: '+92 300 5551234', status: 'active', address: 'Street 9, F-7/2, Islamabad', ordersCount: 5, totalSpent: 115000 },
      { firstName: 'Nadia', lastName: 'Hussain', email: 'nadia.h@example.com', phone: '+92 312 7778888', status: 'inactive', address: 'Block C, Model Town, Lahore', ordersCount: 1, totalSpent: 18500 },
      { firstName: 'Fatima', lastName: 'Raza', email: 'fatima.r@example.com', phone: '+92 345 4449999', status: 'active', address: 'Bahria Town, Phase 4, Rawalpindi', ordersCount: 7, totalSpent: 178000 },
    ];
    await Promise.all(customersData.map((doc) => client.create({ _type: 'customer', ...doc })));

    // 5. Create Reviews
    const reviewsData = [
      { productId: firstProduct._id, customerName: 'Ayesha Khan', customerEmail: 'ayesha.k@example.com', rating: 5, reviewText: 'The embroidery on this is absolutely breathtaking. The emerald color is even richer in person. Truly a masterpiece for the festive season.', status: 'approved' },
      { productId: firstProduct._id, customerName: 'Zainab Malik', customerEmail: 'zainab.m@example.com', rating: 5, reviewText: 'Exceeded my expectations. The chiffon is high quality and the tilla work doesn\'t scratch at all. Shipping was very fast too.', status: 'approved' },
      { productId: secondProduct._id, customerName: 'Sara Ahmed', customerEmail: 'sara.a@example.com', rating: 4, reviewText: 'Beautiful fabric but the sizing runs slightly large. Still a great purchase for the price.', status: 'approved' },
      { productId: secondProduct._id, customerName: 'Nadia Hussain', customerEmail: 'nadia.h@example.com', rating: 3, reviewText: 'Good quality but delivery took longer than expected.', status: 'pending' },
    ];
    await Promise.all(reviewsData.map((doc) => client.create({ _type: 'review', ...doc })));

    // 6. Create Orders (spread over last 15 days)
    const ordersData = [];
    const names = ['Ayesha Khan', 'Zainab Malik', 'Sara Ahmed', 'Nadia Hussain', 'Fatima Raza'];
    const emails = ['ayesha.k@example.com', 'zainab.m@example.com', 'sara.a@example.com', 'nadia.h@example.com', 'fatima.r@example.com'];
    const payStatuses = ['Paid', 'Pending', 'Partially Paid', 'Refunded'];
    const fulfillStatuses = ['Fulfilled', 'Unfulfilled', 'Pending', 'Returned'];

    for (let i = 0; i < 25; i++) {
      const daysAgo = Math.floor(Math.random() * 15);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);

      const custIndex = Math.floor(Math.random() * names.length);
      const total = parseFloat((15000 + Math.random() * 60000).toFixed(0));
      const payStatus = payStatuses[Math.floor(Math.random() * payStatuses.length)];
      const fulfillStatus = fulfillStatuses[Math.floor(Math.random() * fulfillStatuses.length)];

      ordersData.push({
        orderId: `#NZS-${1000 + i}`,
        customer: {
          name: names[custIndex],
          email: emails[custIndex],
          avatar: names[custIndex].split(' ').map((n) => n[0]).join(''),
        },
        date: orderDate.toISOString(),
        total,
        paymentStatus: payStatus,
        fulfillmentStatus: fulfillStatus,
        items: Math.floor(1 + Math.random() * 3),
        channel: 'Online Store',
        tags: Math.random() > 0.7 ? ['VIP'] : [],
        status: 'active',
      });
    }
    // `date` (not Sanity's system-managed, immutable _createdAt) is what the orders
    // API/dashboard use for chronology, so backdating it here is what spreads these
    // seeded orders across the last 15 days for realistic-looking sales trend charts.
    await Promise.all(ordersData.map((doc) => client.create({ _type: 'order', ...doc })));

    // 7. Seed demo Menus
    const mainMenuItems = [
      {
        id: 'menu-home',
        title: 'Home',
        url: '/',
        resourceType: 'page',
        resourceId: 'home',
        children: [],
      },
      {
        id: 'menu-shop',
        title: 'Shop',
        url: '/collection/all',
        resourceType: 'page',
        resourceId: 'all',
        children: [
          { id: 'menu-lawn',    title: 'Lawn',    url: '/collection/lawn',    resourceType: 'collection', resourceId: '', children: [] },
          { id: 'menu-chiffon', title: 'Chiffon', url: '/collection/chiffon', resourceType: 'collection', resourceId: '', children: [] },
          { id: 'menu-organza', title: 'Organza', url: '/collection/organza', resourceType: 'collection', resourceId: '', children: [] },
        ],
      },
      {
        id: 'menu-new-arrivals',
        title: 'New Arrivals',
        url: '/collection/new-arrivals',
        resourceType: 'collection',
        resourceId: '',
        children: [],
      },
      {
        id: 'menu-about',
        title: 'About',
        url: '/about',
        resourceType: 'page',
        resourceId: 'about',
        children: [],
      },
      {
        id: 'menu-contact',
        title: 'Contact',
        url: '/contact',
        resourceType: 'page',
        resourceId: 'contact',
        children: [],
      },
    ];

    const footerMenuItems = [
      { id: 'f-privacy', title: 'Privacy Policy', url: '/pages/privacy', resourceType: 'page', resourceId: 'privacy', children: [] },
      { id: 'f-terms',   title: 'Terms of Service', url: '/pages/terms', resourceType: 'page', resourceId: 'terms', children: [] },
      { id: 'f-contact', title: 'Contact Us',    url: '/contact',       resourceType: 'page', resourceId: 'contact', children: [] },
    ];

    await Promise.all([
      client.create({ _type: 'menu', name: 'Main Menu', handle: 'main-menu', position: 'header', items: mainMenuItems }),
      client.create({ _type: 'menu', name: 'Footer Links', handle: 'footer-links', position: 'footer', items: footerMenuItems }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: `Database seeded successfully with ${collections.length} collections, ${products.length} products from products.json, 5 customers, 4 reviews, 25 orders, and 2 demo menus.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
