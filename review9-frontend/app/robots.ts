import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://inverv.entrext.in';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/admin',
        '/payment',
        '/settings',
        '/profile',
        '/interview/test-me',
        '/interview/test-me-free',
        '/interview/test-me-pro',
        '/interview/test-me-ultra',
        '/*?*', // Disallow query parameters to prevent duplicate content indexing
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
