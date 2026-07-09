import client from '@/lib/sanityClient';
import { PRODUCT_PROJECTION } from '@/lib/sanityQueries';
import ProductPageClient from './ProductPageClient';
import { notFound } from 'next/navigation';

// ISR: Revalidate cached product detail pages every 10 minutes (600s)
export const revalidate = 600;

// Generate pages on-demand for slugs not pre-rendered during build
export const dynamicParams = true;

// Pre-render the top 20 active products at build time to speed up deployment builds
export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(
      `*[_type == "product" && status == "active"][0...20].slug`
    );
    return slugs.filter(Boolean).map((slug) => ({ slug }));
  } catch (error) {
    console.error('Failed to generate static params for products:', error);
    return [];
  }
}

// Fetch single product details directly from Sanity on the server
async function getProduct(slug) {
  try {
    const product = await client.fetch(`*[_type == "product" && slug == $slug][0]${PRODUCT_PROJECTION}`, { slug });
    return product || null;
  } catch (error) {
    console.error(`Error loading product slug "${slug}":`, error);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductPageClient initialProduct={product} />;
}
