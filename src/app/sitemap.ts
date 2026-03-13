import { MetadataRoute } from 'next';

interface SitemapItem {
  slug: string;
  updated_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nodalcv.com';
  const sitemapDataUrl = process.env.NEXT_PUBLIC_SITEMAP_DATA_URL;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-01-27'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  if (!sitemapDataUrl) {
    console.error('NEXT_PUBLIC_SITEMAP_DATA_URL is not defined');
    return staticPages;
  }

  try {
    const response = await fetch(sitemapDataUrl, {
      method: 'GET',
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap data: ${response.statusText}`);
    }

    const data = await response.json();

    let items: SitemapItem[] = [];

    if (Array.isArray(data)) {
      items = data
        .map((item: any) => ({
          slug: item.slug || item.data?.slug,
          updated_at: item.updated_at,
        }))
        .filter((item) => Boolean(item.slug));
    }

    const profileEntries: MetadataRoute.Sitemap = items.map((item) => ({
      url: `${baseUrl}/cv/${item.slug}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticPages, ...profileEntries];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
