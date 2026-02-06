import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nodalcv.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/cv/edit/', '/statistiques/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
