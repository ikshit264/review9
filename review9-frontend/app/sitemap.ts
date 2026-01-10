import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://inverv.entrext.in';

    // These are the core public pages
    // In a real app, you might fetch dynamic routes like job postings from an API
    const routes = [
        '',
        '/login',
        '/register',
        '/interview/demo',
        '/terms',
        '/privacy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
