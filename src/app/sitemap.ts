import { MetadataRoute } from 'next';

interface SitemapItem {
  slug: string;
  updated_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nodalcv.com';
  const sitemapDataUrl = process.env.NEXT_PUBLIC_SITEMAP_DATA_URL;

  if (!sitemapDataUrl) {
    console.error('NEXT_PUBLIC_SITEMAP_DATA_URL is not defined');
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }

  try {
    const response = await fetch(sitemapDataUrl, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap data: ${response.statusText}`);
    }

    const data = await response.json();
    
    // On s'attend à un tableau d'objets contenant le slug
    // Si la structure est similaire à celle du CV (tableau d'objets avec une propriété data)
    let slugs: string[] = [];
    
    if (Array.isArray(data)) {
      slugs = data.map((item: any) => item.slug || item.data?.slug).filter(Boolean);
    }

    const profileEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
      url: `${baseUrl}/cv/${slug}`,
      lastModified: new Date(), // Idéalement, utiliser item.updated_at si disponible
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [
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
      ...profileEntries,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}
