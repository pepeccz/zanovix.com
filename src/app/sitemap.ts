import { MetadataRoute } from 'next';

// Replace with your actual domain
const domain = 'https://www.zanovix.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  // Add more URLs as your site grows
  const routes = ['/', '/formacion-consultoria', '/desarrollo-soluciones', '/consultoria'];
  const lastModified = new Date(); // Or fetch dynamically if pages change often

  return routes.map((route) => ({
    url: `${domain}${route}`,
    lastModified,
    changeFrequency: 'monthly', // Adjust as needed ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')
    priority: route === '/' ? 1 : 0.8, // Give homepage higher priority
  }));
}
