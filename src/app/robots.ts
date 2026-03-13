import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nodalcv.com';

  const publicPaths = ['/', '/cv/', '/search'];
  const privatePaths = ['/cv/edit/', '/statistiques/', '/dashboard/', '/mon-cv/'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: publicPaths,
        disallow: privatePaths,
      },
      // Crawlers IA : accès aux profils publics autorisé
      {
        userAgent: 'GPTBot',
        allow: publicPaths,
        disallow: privatePaths,
      },
      {
        userAgent: 'ClaudeBot',
        allow: publicPaths,
        disallow: privatePaths,
      },
      {
        userAgent: 'Google-Extended',
        allow: publicPaths,
        disallow: privatePaths,
      },
      {
        userAgent: 'PerplexityBot',
        allow: publicPaths,
        disallow: privatePaths,
      },
      {
        userAgent: 'cohere-ai',
        allow: publicPaths,
        disallow: privatePaths,
      },
      {
        userAgent: 'Meta-ExternalAgent',
        allow: publicPaths,
        disallow: privatePaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
