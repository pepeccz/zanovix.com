import { MetadataRoute } from 'next';

// Replace with your actual domain
const domain = 'https://www.zanovix.ai'; // Updated domain

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Disallow specific paths if needed, e.g., admin pages
        // disallow: '/admin/',
      },
    ],
    sitemap: `${domain}/sitemap.xml`,
  };
}
