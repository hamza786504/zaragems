import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || 'production';
const apiVersion = process.env.SANITY_API_VERSION || '2025-01-01';
const token = process.env.SANITY_API_TOKEN;

if (!projectId) {
  throw new Error('Please define the SANITY_PROJECT_ID environment variable');
}

if (!token) {
  throw new Error('Please define the SANITY_API_TOKEN environment variable');
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: 'raw',
});

export default client;
