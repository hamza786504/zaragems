import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || 'production';
const apiVersion = process.env.SANITY_API_VERSION || '2025-01-01';

if (!projectId) {
  throw new Error('Please define the SANITY_PROJECT_ID environment variable');
}

// Public client for storefront - uses Sanity CDN for caching and only published documents
export const publicClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // No token needed for public reads
  useCdn: true, // ENABLE Sanity CDN caching
  perspective: 'published', // Only return published docs
  // Optional: Configure staleness for better CDN hit rate
  staleness: { maxAge: 60, revalidate: 0 }
});