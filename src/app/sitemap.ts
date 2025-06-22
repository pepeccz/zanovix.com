import { MetadataRoute } from 'next';

// Replace with your actual domain
const domain = 'https://www.zanovix.ai'; // Updated domain

export default function sitemap(): MetadataRoute.Sitemap {
  // Solo incluir la página principal
  const routes = ['/'];
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${domain}${route}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 1, // Página principal con máxima prioridad
  }));
}