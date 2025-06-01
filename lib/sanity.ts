import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { env } from './env';

// Initialize Sanity client
export const client = createClient({
  projectId: env.sanity.projectId,
  dataset: env.sanity.dataset,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: env.sanity.apiToken, // Needed for mutations
});

// Image URL builder
const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// Revalidation helper for Next.js
export const sanityFetch = async <T = any>(
  query: string,
  params: Record<string, any> = {},
  tags: string[] = []
): Promise<T> => {
  return client.fetch<T>(query, params, {
    next: {
      revalidate: process.env.NODE_ENV === 'development' ? 0 : 60,
      tags,
    },
  });
};